import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProtectedLayout } from "../../components/layouts/ProtectedLayout";

export const Route = createFileRoute("/_protected")({
  beforeLoad: async ({ context, location }) => {
    // First check if auth loading is already complete
    if (context.auth.isLoading) {
      // If auth check is in progress, wait for it to complete
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
    }

    // If not authenticated after loading is complete, redirect to login
    if (!context.auth.isAuthenticated) {
      // Ensure we don't have a stale IS_LOGGED_OUT_KEY value
      if (localStorage.getItem("apollo_logged_out") !== "true") {
        // If not explicitly logged out, try one more auth check
        await context.auth.checkAuth();

        // If still not authenticated, then redirect
        if (!context.auth.isAuthenticated) {
          throw redirect({
            to: "/login",
            search: {
              redirect: location.pathname
            }
          });
        }
      } else {
        throw redirect({
          to: "/login",
          search: {
            redirect: location.pathname
          }
        });
      }
    }
  },
  component: ProtectedLayout
});
