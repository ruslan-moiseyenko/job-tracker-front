import { ApolloProvider } from '@apollo/client';
import { RouterProvider } from '@tanstack/react-router';

import { ThemeProvider } from '@/components/common/ThemeProvider.tsx';
import { LoadingProvider } from '@/components/ui/LoadingContext';
import { Toaster } from '@/components/ui/sonner';
import { apolloClient } from '@/graphql/apolloClient.ts';
import { router } from '@/router';

export function App() {
  return (
    <ApolloProvider client={apolloClient}>
      <ThemeProvider defaultTheme="dark" storageKey="ui-theme">
        <LoadingProvider defaultVariant="spinner" defaultMessage="Loading...">
          <RouterProvider router={router} />
          <Toaster />
        </LoadingProvider>
      </ThemeProvider>
    </ApolloProvider>
  );
}
