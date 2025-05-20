import { LoginCard } from "@/auth/components/LoginCard";
import type { OAuthProvider } from "@/auth/components/OAuthProviderButtons";
import { GoogleIcon } from "@/auth/components/OAuthProviderIcons";
import { useGoogleAuthPopup } from "@/auth/hooks/useGoogleAuthPopup";
import type { ILoginInput } from "@/auth/types";
import { logger as sentryLogger } from "@sentry/react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { IS_LOGGED_OUT_KEY } from "@/graphql/apolloClient";
import { logger } from "@/lib/logger";

export const Route = createFileRoute("/_auth/login")({
  beforeLoad: async ({ context }) => {
    // If already authenticated, redirect directly
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/panel" });
    }

    // If auth check is still in progress, wait for it
    if (context.auth.isLoading) {
      await new Promise<void>((resolve) => {
        const checkAuthStatus = () => {
          if (!context.auth.isLoading) {
            resolve();
          } else {
            setTimeout(checkAuthStatus, 50);
          }
        };
        checkAuthStatus();
      });

      // After loading finished, redirect if authenticated
      if (context.auth.isAuthenticated) {
        throw redirect({ to: "/panel" });
      }
    }

    // If we're not explicitly logged out, try a fresh auth check
    if (localStorage.getItem(IS_LOGGED_OUT_KEY) !== "true") {
      logger.info(
        "Login route: Not explicitly logged out, checking auth again"
      );
      await context.auth.checkAuth();

      // After this final check, redirect if authenticated
      if (context.auth.isAuthenticated) {
        throw redirect({ to: "/panel" });
      }
    }
  },
  component: LoginPage
});

function LoginPage() {
  const { auth } = Route.useRouteContext();
  const { isLoading, login } = auth;
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async ({ email, password }: ILoginInput) => {
    try {
      setError(null);
      // Clear the logged out flag when user actively tries to log in
      localStorage.removeItem(IS_LOGGED_OUT_KEY);
      await login(email, password);
      navigate({ to: "/panel" });
    } catch (err) {
      let errorMessage = "Invalid email or password.";
      if (err instanceof Error) {
        // Use the error message directly
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  const onSuccess = async () => {
    // Remove logged out flag
    localStorage.removeItem(IS_LOGGED_OUT_KEY);

    // Update auth state before navigation
    await auth.checkAuth();

    // Then navigate to panel
    navigate({ to: "/panel" });
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onError = (err: any) => {
    sentryLogger.error("❌ Auth error:", err);
  };

  // OAuth provider handlers
  const handleGoogleLogin = useGoogleAuthPopup(onSuccess, onError);

  // Define available OAuth providers
  const oauthProviders: OAuthProvider[] = [
    {
      id: "google",
      name: "Google",
      icon: <GoogleIcon />,
      handleLogin: handleGoogleLogin
    }
  ];

  return (
    <LoginCard
      handleSubmit={handleSubmit}
      oauthProviders={oauthProviders}
      isLoading={isLoading}
      error={error}
    />
  );
}
