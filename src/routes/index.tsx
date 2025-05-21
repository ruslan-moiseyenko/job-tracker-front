import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: async ({ context }) => {
    // Make sure auth is not already explicitly logged out
    const isLoggedOut = localStorage.getItem("apollo_logged_out") === "true";

    // First check if auth loading is already complete or in progress
    if (
      context.auth.isLoading ||
      (!context.auth.isAuthenticated && !isLoggedOut)
    ) {
      // If auth check is in progress or hasn't been done yet, wait for it to complete
      await new Promise<void>((resolve) => {
        const checkAuthStatus = () => {
          if (!context.auth.isLoading) {
            resolve();
          } else {
            setTimeout(checkAuthStatus, 50); // Check again after 50ms
          }
        };
        checkAuthStatus();
      });

      // If not authenticated yet and not explicitly logged out,
      // try one more explicit auth check
      if (!context.auth.isAuthenticated && !isLoggedOut) {
        console.log("Index route: Trying one explicit auth check");
        await context.auth.checkAuth();
      }
    }

    // Now make the routing decision based on authenticated status
    if (context.auth.isAuthenticated) {
      console.log("Index route: User is authenticated, redirecting to panel");
      throw redirect({ to: "/panel" });
    } else {
      console.log(
        "Index route: User is not authenticated, redirecting to login"
      );
      throw redirect({ to: "/login" });
    }
  }
});
