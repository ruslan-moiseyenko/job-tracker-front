import {
  GET_ME_QUERY,
  LOGIN_MUTATION,
  REGISTER_MUTATION
} from "@/auth/queries";
import type {
  IAuthClient,
  ILoginMutationResponse,
  IMeQueryResponse,
  IRegisterInput,
  IRegistrationMutationResponse,
  User
} from "@/auth/types";
import {
  apolloClient,
  resetApolloCache,
  terminateActiveQueries,
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  IS_LOGGED_OUT_KEY
} from "@/graphql/apolloClient";
import { logger } from "@/lib/logger";
import { type ApolloQueryResult } from "@apollo/client";

// Factory function to create Auth instances
export const createAuthInstance = (): Auth => {
  return new Auth();
};

export class Auth implements IAuthClient {
  user: User | null = null;
  isAuthenticated: boolean = false;
  isLoading: boolean = false;
  constructor() {
    // Load token from localStorage on initialization
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (token) {
      this.isAuthenticated = true;
    }

    // Reset logged out flag on initialization
    localStorage.removeItem(IS_LOGGED_OUT_KEY);

    // Bind methods to preserve 'this' context,
    // instead of using arrow functions
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.logout = this.logout.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
  }

  async checkAuth(): Promise<boolean> {
    // If no token exists or user is logged out, don't even try to check auth
    if (
      !localStorage.getItem(ACCESS_TOKEN_KEY) ||
      localStorage.getItem(IS_LOGGED_OUT_KEY) === "true"
    ) {
      this.isAuthenticated = false;
      this.user = null;
      return false;
    }

    this.isLoading = true;
    try {
      const result: ApolloQueryResult<IMeQueryResponse> =
        await apolloClient.query({
          query: GET_ME_QUERY,
          fetchPolicy: "network-only" // Always fetch the latest data, no caching
        });

      if (result.data?.me) {
        this.user = result.data.me;
        this.isAuthenticated = true;
        this.isLoading = false;
        return true;
      }
    } catch (error) {
      logger.error("Authentication error: ", error);
      // Clear tokens if auth check fails due to invalid token
      if (
        error instanceof Error &&
        (error.message.includes("logged in") ||
          error.message.includes("unauthorized") ||
          error.message.includes("token"))
      ) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }
    }

    this.user = null;
    this.isAuthenticated = false;
    this.isLoading = false;
    return false;
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading = true;

    try {
      const result = await apolloClient.mutate<ILoginMutationResponse>({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
        errorPolicy: "none"
      });

      // Check if there are GraphQL errors in the response
      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors[0].message || "Login failed";
        logger.debug("GraphQL error detected:", errorMessage);
        throw new Error(errorMessage);
      }

      if (result.data) {
        const { accessToken, refreshToken, user } = result.data.login;

        // Remove logged out flag when logging in
        localStorage.removeItem(IS_LOGGED_OUT_KEY);

        // Store tokens
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        // Basic user data from login response
        this.user = {
          id: "", // We'll get the full user data on next page load
          email: user?.email || ""
        };
        this.isAuthenticated = true;

        // Reset apollo cache to make sure we have fresh data
        await resetApolloCache();
      }
    } catch (error) {
      logger.debug("🔍 Error caught in auth client login method:", error);

      // Make sure we properly forward the GraphQL error
      this.isLoading = false;
      throw error; // Re-throw the original error to preserve its structure
    } finally {
      this.isLoading = false;
    }
  }

  async register(data: IRegisterInput): Promise<void> {
    this.isLoading = true;

    try {
      const result = await apolloClient.mutate<IRegistrationMutationResponse>({
        mutation: REGISTER_MUTATION,
        variables: { input: data }
      });

      if (result.data?.register) {
        const { accessToken, refreshToken, user } = result.data.register;

        // Remove logged out flag when registering
        localStorage.removeItem(IS_LOGGED_OUT_KEY);

        // Store tokens
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);

        this.user = user;
        this.isAuthenticated = true;

        // Reset apollo cache
        await resetApolloCache();
      }
    } catch (error) {
      // Import logger dynamically to avoid circular dependencies
      const { logger } = await import("@/lib/logger");
      logger.error("Registration error:", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async logout(): Promise<void> {
    // Set logout flag first to prevent token refresh attempts
    localStorage.setItem(IS_LOGGED_OUT_KEY, "true");

    // Stop active queries to prevent errors
    terminateActiveQueries();

    // Remove tokens
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);

    // Update auth state
    this.user = null;
    this.isAuthenticated = false;

    // Reset Apollo cache after operations are stopped
    await resetApolloCache();

    // Navigate to login page
    // Using window.location for a full refresh to clear all apollo state
    if (
      window.location.pathname !== "/" &&
      window.location.pathname !== "/login" &&
      window.location.pathname !== "/register"
    ) {
      window.location.href = "/login";
    }
  }
}
