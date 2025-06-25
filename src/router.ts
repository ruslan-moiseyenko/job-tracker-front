import { createRouter } from '@tanstack/react-router';

import { createAuthInstance } from '@/features/auth/client.ts';

import { routeTree } from './routeTree.gen.ts';

// Create auth instance
const auth = createAuthInstance();

// We'll initialize auth check in the root route component instead of here
// to ensure it's properly handled with loading states

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  context: {
    auth
  }
});

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
