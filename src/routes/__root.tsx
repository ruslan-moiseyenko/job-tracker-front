import type { AuthClient } from "@/auth/types";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface IRouterContext {
  auth: AuthClient;
}

export const Route = createRootRouteWithContext<IRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  )
});
