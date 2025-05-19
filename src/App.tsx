import { ThemeProvider } from "@/components/common/ThemeProvider.tsx";
import { apolloClient } from "@/graphql/apolloClient.ts";
import { router } from "@/router";
import { ApolloProvider } from "@apollo/client";
import { RouterProvider } from "@tanstack/react-router";

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <RouterProvider router={router} />
      </ThemeProvider>
    </ApolloProvider>
  );
}
