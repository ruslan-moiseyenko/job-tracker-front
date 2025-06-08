import { useEffect } from 'react';

import { useNavigate } from '@tanstack/react-router';

import { setRouterNavigate } from '@/graphql/apolloClient';

/**
 * Component that sets up the router navigation function for Apollo Client
 * in order to use TanStack Router navigation
 * instead of window.location.href, preventing page reloads
 */
export function RouterApolloSetup() {
  const navigate = useNavigate();

  useEffect(() => {
    // Set the navigation function to use in Apollo Client
    setRouterNavigate(navigate);

    // Cleanup function to remove the navigation function
    return () => {
      setRouterNavigate(null);
    };
  }, [navigate]);

  return null;
}
