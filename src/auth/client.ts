import { type ApolloQueryResult } from '@apollo/client';

import {
  GET_ME_QUERY,
  LOGIN_MUTATION,
  LOGOUT_MUTATION,
  REGISTER_MUTATION
} from '@/auth/queries';
import type {
  IAuthClient,
  ILoginMutationResponse,
  IMeQueryResponse,
  IRegisterInput,
  IRegistrationMutationResponse,
  User
} from '@/auth/types';
import {
  apolloClient,
  resetApolloCache,
  terminateActiveQueries
} from '@/graphql/apolloClient';
import { IS_LOGGED_OUT_KEY } from '@/graphql/local-storage-keys';
import { logger } from '@/lib/logger';

// Factory function to create Auth instances
export const createAuthInstance = (): Auth => {
  return new Auth();
};

export class Auth implements IAuthClient {
  user: User | null = null;
  isAuthenticated: boolean = false;
  isLoading: boolean = false;
  private isAuthCheckInProgress = false;

  constructor() {
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
    // If we're already authenticated, return immediately
    if (this.isAuthenticated && this.user) {
      return true;
    }

    // If already checking auth, wait for the existing check
    if (this.isAuthCheckInProgress) {
      // Wait for the current check to complete
      await new Promise<void>((resolve) => {
        const checkStatus = () => {
          if (!this.isAuthCheckInProgress) {
            resolve();
          } else {
            setTimeout(checkStatus, 50);
          }
        };
        checkStatus();
      });

      // Return the result after the check completes
      return this.isAuthenticated;
    }

    // Start a new auth check
    this.isAuthCheckInProgress = true;
    this.isLoading = true;

    try {
      // Only skip if explicitly logged out
      const isLoggedOut = localStorage.getItem(IS_LOGGED_OUT_KEY) === 'true';
      if (isLoggedOut) {
        this.isAuthenticated = false;
        this.user = null;
        return false;
      }

      const result: ApolloQueryResult<IMeQueryResponse> =
        await apolloClient.query({
          query: GET_ME_QUERY,
          fetchPolicy: 'network-only', // Always fetch the latest data, no caching
          errorPolicy: 'all' // Continue even if there are GraphQL errors
        });

      if (result.data?.me) {
        this.user = result.data.me;
        this.isAuthenticated = true;
        // When successfully authenticated, remove the logged out flag if it exists
        localStorage.removeItem(IS_LOGGED_OUT_KEY);
        return true;
      } else {
        this.isAuthenticated = false;
        this.user = null;

        if (result.errors) {
          // Only set logged out flag if there were actual auth errors
          const hasAuthErrors = result.errors.some(
            (error) => error.extensions?.code === 'UNAUTHENTICATED'
          );

          if (hasAuthErrors) {
            localStorage.setItem(IS_LOGGED_OUT_KEY, 'true');
          }
        }

        return false;
      }
    } catch (error) {
      logger.error('Auth.checkAuth: Authentication error: ', error);
      this.isAuthenticated = false;
      this.user = null;
      // Only set the logged out flag for auth errors
      if (error && typeof error === 'object' && 'networkError' in error) {
        localStorage.setItem(IS_LOGGED_OUT_KEY, 'true');
      }
      return false;
    } finally {
      this.isLoading = false;
      this.isAuthCheckInProgress = false;
    }
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading = true;

    try {
      const result = await apolloClient.mutate<ILoginMutationResponse>({
        mutation: LOGIN_MUTATION,
        variables: { email, password },
        errorPolicy: 'none'
      });

      // Check if there are GraphQL errors in the response
      if (result.errors && result.errors.length > 0) {
        const errorMessage = result.errors[0].message || 'Login failed';
        logger.debug('GraphQL error detected:', errorMessage);
        throw new Error(errorMessage);
      }

      if (result.data) {
        const { user } = result.data.login;

        // Remove logged out flag when logging in
        localStorage.removeItem(IS_LOGGED_OUT_KEY);

        // Basic user data from login response
        this.user = {
          id: '', // We'll get the full user data on next page load
          email: user?.email || '',
          createdAt: user?.createdAt || '',
          updatedAt: user?.updatedAt || ''
        };
        this.isAuthenticated = true;

        // Reset apollo cache to make sure we have fresh data
        await resetApolloCache();
      }
    } catch (error) {
      logger.debug('🔍 Error caught in auth client login method:', error);

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
        const { user } = result.data.register;

        // Remove logged out flag when registering
        localStorage.removeItem(IS_LOGGED_OUT_KEY);

        this.user = user;
        this.isAuthenticated = true;

        // Reset apollo cache
        await resetApolloCache();
      }
    } catch (error) {
      // Import logger dynamically to avoid circular dependencies
      const { logger } = await import('@/lib/logger');
      logger.error('Registration error:', error);
      throw error;
    } finally {
      this.isLoading = false;
    }
  }

  async logout(): Promise<void> {
    // Set logout flag first to prevent token refresh attempts
    localStorage.setItem(IS_LOGGED_OUT_KEY, 'true');

    // Stop active queries to prevent errors
    terminateActiveQueries();

    // Call logout endpoint to clear cookies on the server side
    try {
      await apolloClient.mutate({
        mutation: LOGOUT_MUTATION
      });
    } catch (error) {
      // If logout mutation fails, continue with client-side logout
      logger.error('Logout mutation failed:', error);
    }

    // Update auth state
    this.user = null;
    this.isAuthenticated = false;

    // Reset Apollo cache after operations are stopped
    await resetApolloCache();

    // Navigate to login page
    // Using window.location for a full refresh to clear all apollo state
    if (
      window.location.pathname !== '/' &&
      window.location.pathname !== '/login' &&
      window.location.pathname !== '/register'
    ) {
      window.location.href = '/login';
    }
  }
}
