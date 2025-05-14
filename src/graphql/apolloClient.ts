import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
  Observable
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Check if we're running in a browser environment
const isBrowser = typeof window !== "undefined";

// Create an empty link for SSR context
import { ApolloLink } from "@apollo/client/core";
import { REFRESH_TOKEN } from "../auth/queries";
import type { RefreshTokenResponse } from "@/auth/types";

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

// Function to create a temporary client for token refresh
// to prevent circular dependency and issues with error link
const createRefreshClient = () => {
  const refreshHttpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_API_URL,
    credentials: "include"
  });

  return new ApolloClient({
    link: refreshHttpLink,
    cache: new InMemoryCache()
  });
};

// Error handling link to catch auth errors
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      for (const { message, locations, path } of graphQLErrors) {
        console.error(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        );

        // Handle unauthorized errors
        const isAuthError =
          message.includes("unauthorized") ||
          message.includes("token") ||
          message.includes("logged in");

        if (isAuthError && isBrowser) {
          // Don't try to refresh token during a refresh token operation
          if (operation.operationName === "refreshToken") {
            handleLogout();
            return;
          }

          // Try to refresh the token
          const refreshToken = localStorage.getItem("refresh_token");
          if (refreshToken) {
            return new Observable((observer) => {
              // Create a separate client for token refresh to avoid circular dependency
              const refreshClient = createRefreshClient();

              // Execute the refresh token mutation
              refreshClient
                .mutate<RefreshTokenResponse>({
                  mutation: REFRESH_TOKEN,
                  variables: { refreshToken }
                })
                .then((response) => {
                  if (response.data?.refreshToken) {
                    const { accessToken, refreshToken: newRefreshToken } =
                      response.data.refreshToken;

                    localStorage.setItem("access_token", accessToken);
                    localStorage.setItem("refresh_token", newRefreshToken);

                    // Update the authorization header for the failed operation
                    const oldHeaders = operation.getContext().headers;
                    operation.setContext({
                      headers: {
                        ...oldHeaders,
                        authorization: `Bearer ${accessToken}`
                      }
                    });

                    // Retry the failed operation
                    forward(operation).subscribe({
                      next: observer.next.bind(observer),
                      error: observer.error.bind(observer),
                      complete: observer.complete.bind(observer)
                    });
                  } else {
                    handleLogout();
                    observer.error(new Error("Failed to refresh token"));
                  }
                })
                .catch((error) => {
                  console.error("[Refresh Token Error]:", error);
                  handleLogout();
                  observer.error(error);
                });
            });
          } else {
            handleLogout();
          }
        }
      }
    }

    if (networkError) {
      console.error(`[Network error]: ${networkError}`);
    }
  }
);

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

// Create Apollo Client
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
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
      errorPolicy: "all"
    }
  }
});

export const resetApolloCache = async () => {
  await apolloClient.resetStore();
};
