import * as apolloCore from "@apollo/client/core";
import * as apolloContext from "@apollo/client/link/context";
import * as apolloError from "@apollo/client/link/error";

const { onError } = apolloError;
const { setContext } = apolloContext;
const { ApolloClient, InMemoryCache, from } = apolloCore;

// Check if we're running in a browser environment
const isBrowser = typeof window !== "undefined";

// Create an empty link for SSR context
let httpLink: any = { request: () => {} };

// Only import and use createHttpLink in browser context
if (isBrowser) {
  const { createHttpLink } = apolloCore;
  httpLink = createHttpLink({
    uri: import.meta.env.VITE_GRAPHQL_API_URL || "/graphql"
  });
}

// Auth link middleware to add token to headers
const authLink = setContext((_, { headers }) => {
  // Get the authentication token from local storage if it exists
  const token = isBrowser ? localStorage.getItem("auth-token") : null;

  // Return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : ""
    }
  };
});

// Error handling link to catch auth errors
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      );

      // Handle unauthorized errors
      if (message.includes("unauthorized") || message.includes("token")) {
        if (isBrowser) {
          localStorage.removeItem("auth-token");
          // Force reload to reset Apollo Client state
          if (
            window.location.pathname !== "/" &&
            window.location.pathname !== "/register"
          ) {
            window.location.href = "/";
          }
        }
      }
    });
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);
  }
});

// Create Apollo Client
export const createApolloClient = () => {
  return new ApolloClient({
    link: from([errorLink, authLink, httpLink]),
    cache: new InMemoryCache(),
    connectToDevTools: true,
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network"
      }
    }
  });
};
