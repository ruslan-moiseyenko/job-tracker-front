import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import { ApolloLink } from "@apollo/client/core";

// Check if we're running in a browser environment
const isBrowser = typeof window !== "undefined";

import { REFRESH_TOKEN } from "../auth/queries";
import type { RefreshTokenResponse } from "@/auth/types";
import { logger } from "@/lib/logger";

let httpLink: ApolloLink = new ApolloLink((operation, forward) =>
  forward ? forward(operation) : null
);

// Only import and use createHttpLink in browser context
if (isBrowser) {
  httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_API_URL,
    credentials: "include"
  });
}

// Helper function to handle logout
const handleLogout = () => {
  if (isBrowser) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    // Force reload to reset Apollo Client state
    if (
      window.location.pathname !== "/" &&
      window.location.pathname !== "/register"
    ) {
      window.location.href = "/";
    }
  }
};

// Auth link middleware to add token to headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = isBrowser ? localStorage.getItem("access_token") : null;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

// Define the refresh token path name to identify refresh token operations
const refreshTokenPathName = "refreshToken";

// Create a temporary Apollo client to handle token refresh without circular dependencies
const createRefreshClient = () => {
  return new ApolloClient({
    link: createHttpLink({
      uri: import.meta.env.VITE_GRAPHQL_API_URL,
      credentials: "include"
    }),
    cache: new InMemoryCache()
  });
};

/**
 * Refresh token request function
 * This function is responsible for refreshing the access token using the refresh token
 */
const refreshTokenRequest = async (): Promise<void> => {
  const refreshToken = localStorage.getItem("refresh_token") || "";

  try {
    // Use a separate client to avoid circular dependencies
    const refreshClient = createRefreshClient();

    const response = await refreshClient.mutate<RefreshTokenResponse>({
      mutation: REFRESH_TOKEN,
      variables: { refreshToken }
    });

    if (response.data?.refreshToken) {
      const { accessToken, refreshToken: newRefreshToken } =
        response.data.refreshToken;

      // Update tokens in localStorage
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", newRefreshToken);
    } else {
      handleLogout();
    }
  } catch (error) {
    console.error("[Refresh Token Error]:", error);
    handleLogout();
    throw error;
  }
};

// Error link - detects UNAUTHENTICATED errors and marks operations for refresh
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const err of graphQLErrors) {
        const { path, extensions } = err;

        // Check if the error is an authentication error
        if (extensions?.code !== "UNAUTHENTICATED" || !path) continue;

        // Skip refresh token for refresh token operations
        if (path.includes(refreshTokenPathName)) break;

        // Skip auth-related operations (login/register) where auth errors are expected
        const operationName = operation.operationName;
        if (operationName === "Login" || operationName === "Register") {
          // Let these errors propagate naturally - don't try to refresh token
          continue;
        }

        // Mark operation for refresh
        const { getContext, setContext } = operation;
        const context = getContext();

        setContext({
          ...context,
          headers: {
            ...context?.headers,
            _needsRefresh: true
          }
        });

        return forward(operation);
      }
    }

    if (networkError) {
      logger.error("[Network error]:", networkError);
    }
  }
);

// Refresh token link - checks for _needsRefresh flag and refreshes token
const refreshLink = setContext(async (_, previousContext) => {
  if (previousContext?.headers?._needsRefresh) {
    await refreshTokenRequest();
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
      fetchPolicy: "cache-and-network",
      errorPolicy: "all"
    },
    query: {
      fetchPolicy: "network-only",
      errorPolicy: "all"
    },
    mutate: {
      errorPolicy: "none"
    }
  }
});

export const resetApolloCache = async () => {
  await apolloClient.resetStore();
};
