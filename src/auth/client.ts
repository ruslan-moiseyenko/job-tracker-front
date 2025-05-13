import { GET_ME_QUERY, LOGIN_MUTATION } from "@/auth/queries";
import type {
  AuthClient,
  LoginMutationResult,
  MeQueryResult,
  User
} from "@/auth/types";
import { apolloClient, resetApolloCache } from "@/graphql/apolloClient";
import { type ApolloQueryResult } from "@apollo/client";

export class Auth implements AuthClient {
  user: User | null = null;
  isAuthenticated: boolean = false;
  isLoading: boolean = false;

  constructor() {
    // Load token from localStorage on initialization
    const token = localStorage.getItem("auth_token");
    if (token) {
      this.isAuthenticated = true;
    }
  }

  async checkAuth(): Promise<boolean> {
    this.isLoading = true;
    try {
      const result: ApolloQueryResult<MeQueryResult> = await apolloClient.query(
        {
          query: GET_ME_QUERY,
          fetchPolicy: "network-only" // Always fetch the latest data, no caching
        }
      );

      if (result.data.me) {
        this.user = result.data.me;
        this.isAuthenticated = true;
        this.isLoading = false;
        return true;
      }
    } catch (error) {
      console.error("Authentication error: ", error);
    }

    this.user = null;
    this.isAuthenticated = false;
    this.isLoading = false;
    return false;
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading = true;
    try {
      const result = await apolloClient.mutate<LoginMutationResult>({
        mutation: LOGIN_MUTATION,
        variables: { email, password }
      });

      if (result.data) {
        const { token, user } = result.data.login;

        localStorage.setItem("auth_token", token);

        this.user = user;
        this.isAuthenticated = true;
      }
    } catch (error) {
      console.error("Login error: ", error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem("auth_token");

    this.user = null;
    this.isAuthenticated = false;

    await resetApolloCache();
  }
}
