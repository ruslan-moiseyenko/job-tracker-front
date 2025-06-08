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

// Global refresh state management
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// Router navigation function - will be set externally
let routerNavigate: ((options: { to: string }) => void) | null = null;

// Function to set the router navigation function
export const setRouterNavigate = (
  navigate: ((options: { to: string }) => void) | null
) => {
  routerNavigate = navigate;
};

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

// Helper function to handle logout using router navigation
const handleLogout = () => {
  localStorage.setItem(IS_LOGGED_OUT_KEY, 'true');

  if (isBrowser && shouldRedirectToLogin()) {
    if (routerNavigate) {
      // Use router navigation to avoid page reload
      routerNavigate({ to: '/login' });
    } else {
      // Fallback to window.location.href if router is not available
      window.location.href = '/login';
    }
  }
};

const shouldRedirectToLogin = (): boolean => {
  const pathname = window.location.pathname;
  return pathname !== '/login' && pathname !== '/register' && pathname !== '/';
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
 * Refresh token request function with global state management
 */
const refreshTokenRequest = async (): Promise<boolean> => {
  // If already refreshing, return the existing promise
  if (isRefreshing && refreshPromise) {
    return refreshPromise;
  }

  // Check if user is logged out - if so, don't attempt refresh
  if (localStorage.getItem(IS_LOGGED_OUT_KEY) === 'true') {
    logger.info('User is logged out, skipping refresh token request');
    return false;
  }

  // Set refreshing state and create promise
  isRefreshing = true;
  refreshPromise = performTokenRefresh();

  try {
    const result = await refreshPromise;
    return result;
  } finally {
    // Reset state
    isRefreshing = false;
    refreshPromise = null;
  }
};

const performTokenRefresh = async (): Promise<boolean> => {
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
      handleLogout();
      return false;
    }

    return true;
  } catch (error) {
    logger.error('[Refresh Token Error]:', error);
    handleLogout();
    return false;
  }
};

// Error link - detects UNAUTHENTICATED errors and marks operations for refresh
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    // Check if user is already logged out - if so, don't process errors
    if (localStorage.getItem(IS_LOGGED_OUT_KEY) === 'true') {
      // If on a protected route, redirect to login
      if (isBrowser && shouldRedirectToLogin()) {
        if (routerNavigate) {
          routerNavigate({ to: '/login' });
        } else {
          window.location.href = '/login';
        }
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
          handleLogout();
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
          handleLogout();
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
