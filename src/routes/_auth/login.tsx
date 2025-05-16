import { LoginCard } from "@/auth/components/LoginCard";
import type { ILoginInput } from "@/auth/types";
import { logger } from "@/lib/logger";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GoogleIcon } from "@/auth/components/OAuthProviderIcons";
import type { OAuthProvider } from "@/auth/components/OAuthProviderButtons";

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
  logger.info("LoginPage Base URL: ", import.meta.env.BASE_URL);

  // OAuth provider handlers
  const handleGoogleLogin = () => {
    window.location.href = `${
      import.meta.env.VITE_GRAPHQL_API_URL
    }/auth/google`;
  };

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
