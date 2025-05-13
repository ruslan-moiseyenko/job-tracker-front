import type { IAuthClient } from "@/auth/types";
import { ErrorPage } from "@/components/common/ErrorPage";
import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

interface IRouterContext {
  auth: IAuthClient;
}

export const Route = createRootRouteWithContext<IRouterContext>()({
  component: () => (
    <>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
  errorComponent: ({ error }) => (
    <ErrorPage title={error.name} message={error.message} />
  ),
  notFoundComponent: () => (
    <ErrorPage
      status="404"
      title="Page Not Found"
      message="The requested page could not be found."
    />
  )
});
