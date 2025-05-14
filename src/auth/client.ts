import {
  GET_ME_QUERY,
  LOGIN_MUTATION,
  REGISTER_MUTATION
} from "@/auth/queries";
import type {
  IAuthClient,
  ILoginMutationResult,
  IMeQueryResult,
  IRegisterInput,
  User
} from "@/auth/types";
import { apolloClient, resetApolloCache } from "@/graphql/apolloClient";
import { type ApolloQueryResult } from "@apollo/client";

export class Auth implements IAuthClient {
  user: User | null = null;
  isAuthenticated: boolean = false;
  isLoading: boolean = false;
  constructor() {
    // Load token from localStorage on initialization
    const token = localStorage.getItem("access_token");
    if (token) {
      this.isAuthenticated = true;
    }

    // Bind methods to preserve 'this' context,
    // instead of using arrow functions
    this.login = this.login.bind(this);
    this.register = this.register.bind(this);
    this.logout = this.logout.bind(this);
    this.checkAuth = this.checkAuth.bind(this);
  }

  async checkAuth(): Promise<boolean> {
    // If no token exists, don't even try to check auth
    if (!localStorage.getItem("access_token")) {
      this.isAuthenticated = false;
      this.user = null;
      return false;
    }

    this.isLoading = true;
    try {
      const result: ApolloQueryResult<IMeQueryResult> =
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
      console.error("Authentication error: ", error);
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
      const result = await apolloClient.mutate<ILoginMutationResult>({
        mutation: LOGIN_MUTATION,
        variables: { email, password }
      });

      if (result.data) {
        const { accessToken, refreshToken, user } = result.data.login;

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);

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
      console.error("Login error: ", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async register(data: IRegisterInput): Promise<void> {
    this.isLoading = true;

    try {
      const result = await apolloClient.mutate({
        mutation: REGISTER_MUTATION,
        variables: { input: data }
      });

      if (result.data?.register) {
        const { token, user } = result.data.register;

        // Store token (assuming backend returns a single token for registration)
        localStorage.setItem("access_token", token);

        // Set user data
        this.user = user;
        this.isAuthenticated = true;

        // Reset apollo cache
        await resetApolloCache();
      }
    } catch (error) {
      console.error("Registration error: ", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    this.user = null;
    this.isAuthenticated = false;

    await resetApolloCache();
  }
}
