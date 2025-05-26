import { useEffect, useState } from 'react';

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

import type { IAuthClient } from '@/auth/types';

import { ErrorPage } from '@/components/common/ErrorPage';

interface IRouterContext {
  auth: IAuthClient;
}

export const Route = createRootRouteWithContext<IRouterContext>()({
  beforeLoad: async ({ context }) => {
    // Always clear the logged out flag on root initialization unless explicitly on login page
    // This allows tokens to be checked on app launch/reload
    const explicitlyOnLoginPage =
      window.location.pathname === '/login' ||
      window.location.pathname === '/register';

    if (!explicitlyOnLoginPage) {
      localStorage.removeItem('apollo_logged_out');
    }

    // The protected routes and index route will handle their own auth checks
    // But we'll start the process here
    try {
      await context.auth.checkAuth();
    } catch (error) {
      console.error('Error during root auth check:', error);
    }
  },

  component: () => {
    const { auth } = Route.useRouteContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      const initializeAuth = async () => {
        // Only wait for auth check if we're not already authenticated
        if (!auth.isAuthenticated) {
          await auth.checkAuth();
        }
        setIsLoading(false);
      };

      initializeAuth();
    }, [auth]);

    if (isLoading) {
      return <div>Loading authentication...</div>; // Show a loading spinner
    }

    return (
      <>
        <Outlet />
        <TanStackRouterDevtools position="bottom-right" />
      </>
    );
  },
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
