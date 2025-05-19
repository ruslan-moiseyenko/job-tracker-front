import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen.ts";
import { createAuthInstance } from "./auth/client.ts";

// Create auth instance
const auth = createAuthInstance();

// Only check auth if there's a token - prevents unnecessary GraphQL errors for non-logged-in users
if (
  typeof localStorage !== "undefined" &&
  localStorage.getItem("access_token")
) {
  auth.checkAuth().catch(console.error);
}

// Create a new router instance
export const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  context: {
    auth
  }
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
