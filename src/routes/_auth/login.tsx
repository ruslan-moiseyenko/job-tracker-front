import { LoginCard } from "@/auth/components/LoginCard";
import type { OAuthProvider } from "@/auth/components/OAuthProviderButtons";
import { GoogleIcon } from "@/auth/components/OAuthProviderIcons";
import { useGoogleAuthPopup } from "@/auth/hooks/useGoogleAuthPopup";
import type { ILoginInput } from "@/auth/types";
import { logger as sentryLogger } from "@sentry/react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  IS_LOGGED_OUT_KEY
} from "@/graphql/apolloClient";

export const Route = createFileRoute("/_auth/login")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/panel" });
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

  const onSuccess = async (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => {
    // Remove logged out flag
    localStorage.removeItem(IS_LOGGED_OUT_KEY);

    // Set tokens using constants
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);

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
