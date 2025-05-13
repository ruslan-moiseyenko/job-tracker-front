import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from
} from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Check if we're running in a browser environment
const isBrowser = typeof window !== "undefined";

// Create an empty link for SSR context
import { ApolloLink } from "@apollo/client/core";

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
