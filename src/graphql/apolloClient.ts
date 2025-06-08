import {
  ApolloClient,
  createHttpLink,
  from,
  InMemoryCache
} from '@apollo/client/core';
import { ApolloLink } from '@apollo/client/core';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

import type { RefreshTokenResponse } from '@/auth/types';
import { logger } from '@/lib/logger';

import { REFRESH_TOKEN } from '../auth/queries';

// Check if we're running in a browser environment
const isBrowser = typeof window !== 'undefined';

// Constants for localStorage keys
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';
export const IS_LOGGED_OUT_KEY = 'apollo_logged_out';

let httpLink: ApolloLink = new ApolloLink((operation, forward) =>
  forward ? forward(operation) : null
);

// Only import and use createHttpLink in browser context
if (isBrowser) {
  httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_API_URL + '/graphql',
    credentials: 'include'
  });
}

// Helper function to handle logout
// NOTE: We now directly use the logout logic inline instead of calling this function
// to make the flow more explicit and avoid missed redirects
const _handleLogout = () => {
  if (isBrowser) {
    localStorage.setItem(IS_LOGGED_OUT_KEY, 'true');
    // Force reload to reset Apollo Client state
    window.location.href = '/login';
  }
};

const authLink = setContext((_, { headers }) => {
  return {
    headers: {
      ...headers
    }
  };
});

// Define the refresh token path name to identify refresh token operations
const refreshTokenPathName = 'refreshToken';

// Create a temporary Apollo client to handle token refresh without circular dependencies
const createRefreshClient = () => {
  return new ApolloClient({
    link: createHttpLink({
      uri: import.meta.env.VITE_GRAPHQL_API_URL + '/graphql',
      credentials: 'include'
    }),
    cache: new InMemoryCache()
  });
};

/**
 * Refresh token request function
 * This function is responsible for refreshing the access token using the refresh token
 */
const refreshTokenRequest = async (): Promise<boolean> => {
  // Check if user is logged out - if so, don't attempt refresh
  if (localStorage.getItem(IS_LOGGED_OUT_KEY) === 'true') {
    logger.info('User is logged out, skipping refresh token request');
    return false;
  }

  try {
    // Use a separate client to avoid circular dependencies
    const refreshClient = createRefreshClient();

    const response = await refreshClient.mutate<RefreshTokenResponse>({
      mutation: REFRESH_TOKEN,
      errorPolicy: 'all' // Continue even if there are GraphQL errors
    });

    // Check if the response contains data and was successful
    if (!response.data?.refreshToken.success) {
      logger.error('[Refresh Token Failed]: Success flag is false');
      localStorage.setItem(IS_LOGGED_OUT_KEY, 'true');

      // Instead of redirecting (causing page reload),
      // timeout is set to allow other operations to complete first
      // This prevents the page from immediately reloading and re-triggering requests
      if (isBrowser) {
        setTimeout(() => {
          // Only redirect if we're not already on the login page
          if (
            window.location.pathname !== '/login' &&
            window.location.pathname !== '/register' &&
            window.location.pathname !== '/'
          ) {
            window.location.href = '/login';
          }
        }, 100);
      }

      return false;
    }

    return true;
  } catch (error) {
    logger.error('[Refresh Token Error]:', error);
    // Set the logged out flag to prevent further refresh attempts
    localStorage.setItem(IS_LOGGED_OUT_KEY, 'true');

    // Same delayed redirect approach as above
    if (isBrowser) {
      setTimeout(() => {
        if (
          window.location.pathname !== '/login' &&
          window.location.pathname !== '/register' &&
          window.location.pathname !== '/'
        ) {
          window.location.href = '/login';
        }
      }, 100);
    }

    return false;
  }
};

// Error link - detects UNAUTHENTICATED errors and marks operations for refresh
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    // Check if user is already logged out - if so, don't process errors
    if (localStorage.getItem(IS_LOGGED_OUT_KEY) === 'true') {
      // If on a protected route, redirect to login
      if (
        isBrowser &&
        window.location.pathname !== '/' &&
        window.location.pathname !== '/login' &&
        window.location.pathname !== '/register'
      ) {
        window.location.href = '/login';
      }
      return;
    }

    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const { path, extensions } = err;

        // Check if the error is an authentication error
        if (extensions?.code !== 'UNAUTHENTICATED' || !path) continue;

        // Skip refresh token for refresh token operations to avoid loops
        if (path.includes(refreshTokenPathName)) {
          // If refreshToken operation itself fails with UNAUTHENTICATED, we should logout
          logger.error('Refresh token operation failed with UNAUTHENTICATED');
          localStorage.setItem(IS_LOGGED_OUT_KEY, 'true');
          if (isBrowser) {
            window.location.href = '/login';
          }
          return;
        }

        // Skip auth-related operations (login/register) where auth errors are expected
        const operationName = operation.operationName;
        if (operationName === 'Login' || operationName === 'Register') {
          continue;
        }

        // Mark operation for refresh
        const { getContext, setContext } = operation;
        const context = getContext();

        if (context._retryAttempt) {
          // Prevent infinite retry loops
          logger.error('Retry loop detected. Aborting.');
          localStorage.setItem(IS_LOGGED_OUT_KEY, 'true');
          if (isBrowser) {
            window.location.href = '/login';
          }
          return;
        }

        setContext({
          ...context,
          _retryAttempt: true, // Mark this operation as retried
          headers: {
            ...context?.headers,
            _needsRefresh: true
          }
        });

        return forward(operation);
      }
    }

    if (networkError) {
      logger.error('[Network error]:', networkError);
    }
  }
);

// Refresh token link - checks for _needsRefresh flag and refreshes token
const refreshLink = setContext(async (_, previousContext) => {
  // Check if user is already logged out - if so, don't attempt refresh
  if (localStorage.getItem(IS_LOGGED_OUT_KEY) === 'true') {
    return previousContext;
  }

  if (previousContext?.headers?._needsRefresh) {
    const refreshSuccess = await refreshTokenRequest();

    // Only clear the refresh flag if the refresh was successful
    if (refreshSuccess) {
      return {
        ...previousContext,
        headers: {
          ...previousContext.headers,
          _needsRefresh: false
        }
      };
    } else {
      // If refresh failed, keep the context but don't retry operations
      return previousContext;
    }
  }

  return previousContext;
});

// Create Apollo Client with the full link chain
export const apolloClient = new ApolloClient({
  link: from([errorLink, refreshLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  connectToDevTools: true,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-first', // Changed from 'cache-and-network' to prevent double renders
      errorPolicy: 'all'
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all'
    },
    mutate: {
      errorPolicy: 'none'
    }
  }
});

// Function to clean up Apollo state
export const terminateActiveQueries = () => {
  // Stops all active queries
  apolloClient.stop();
};

export const resetApolloCache = async () => {
  await apolloClient.resetStore();
};
