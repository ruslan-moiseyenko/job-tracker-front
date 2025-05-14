import { LoginCard } from "@/auth/components/LoginCard";
import { LOGIN_MUTATION } from "@/auth/queries";
import type { ILoginInput, ILoginMutationResponse } from "@/auth/types";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@apollo/client";

export const Route = createFileRoute("/_auth/login-with-mutation")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/panel" });
    }
  },
  component: LoginPage
});

function LoginPage() {
  const { auth } = Route.useRouteContext();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Use Apollo's useMutation hook directly
  const [loginMutation, { loading: isLoading }] =
    useMutation<ILoginMutationResponse>(LOGIN_MUTATION, {
      onCompleted: (data) => {
        // Handle successful login
        if (data && data.login) {
          const { accessToken, refreshToken, user } = data.login;

          // Store tokens
          localStorage.setItem("access_token", accessToken);
          localStorage.setItem("refresh_token", refreshToken);

          // Update auth state (normally done by auth client)
          auth.user = {
            id: "",
            email: user?.email || ""
          };
          auth.isAuthenticated = true;

          // Navigate to panel
          navigate({ to: "/panel" });
        }
      },
      onError: (error) => {
        console.log("🚀 Direct mutation error:", error);
        console.log("🚀 GraphQL Errors:", error.graphQLErrors);
        console.log("🚀 Network Error:", error.networkError);

        // Extract error message
        let errorMessage = "Invalid email or password.";
        if (error.graphQLErrors && error.graphQLErrors.length > 0) {
          const gqlError = error.graphQLErrors[0];
          console.log("🚀 First GraphQL Error:", gqlError);
          errorMessage = gqlError.message || errorMessage;
        }

        setError(errorMessage);
      }
    });

  const handleSubmit = async ({ email, password }: ILoginInput) => {
    setError(null);
    try {
      await loginMutation({
        variables: { email, password }
      });
    } catch (err) {
      // This catch block should not be needed since we're using onError,
      // but it's here as a fallback
      console.log("🚀 Unexpected error in mutation execution:", err);
      setError("An unexpected error occurred. Please try again.");
    }
  };

  return (
    <LoginCard
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}
