import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Loader2 } from "lucide-react";

type PublicRouteProps = {
  children?: React.ReactNode;
  redirectTo?: string;
};

export const PublicRoute: React.FC<PublicRouteProps> = ({
  children,
  redirectTo = "/dashboard"
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Get the intended destination from state, if any
  const from = location.state?.from?.pathname || redirectTo;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard or intended destination
  if (user) {
    return <Navigate to={from} replace />;
  }

  // Otherwise, render the public route
  return <>{children ? children : <Outlet />}</>;
};
