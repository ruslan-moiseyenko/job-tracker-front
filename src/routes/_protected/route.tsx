import { createFileRoute, redirect } from "@tanstack/react-router";
import { ProtectedLayout } from "../../components/layouts/ProtectedLayout";

export const Route = createFileRoute("/_protected")({
  beforeLoad: ({ context, location }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/login",
        search: {
          redirect: location.href
        }
      });
    }
  },
  component: ProtectedLayout
});
