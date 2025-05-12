import React from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "~/hooks/useAuth";
import { Loader2 } from "lucide-react";

type ProtectedRouteProps = {
  children?: React.ReactNode;
};

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen w-screen bg-background text-foreground">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    // Redirect to login page with the return url
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // If there are children, return them
  // Otherwise, render the nested routes with Outlet
  return <>{children ? children : <Outlet />}</>;
};
