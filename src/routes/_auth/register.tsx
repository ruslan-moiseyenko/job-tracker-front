import { RegistrationCard } from "@/auth/components/RegistrationCard";
import type { IRegisterInput } from "@/auth/types";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ApolloError } from "@apollo/client";

export const Route = createFileRoute("/_auth/register")({
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({ to: "/panel" });
    }
  },
  component: RegisterPage
});

function RegisterPage() {
  const { auth } = Route.useRouteContext();
  const { isLoading } = auth;
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: IRegisterInput) => {
    try {
      setError(null); // Clear previous errors
      await auth.register(data);
      navigate({ to: "/panel" });
    } catch (err) {
      // Extract the actual error message from the GraphQL error
      let errorMessage =
        "Registration failed. Please check your information and try again.";
      if (err instanceof ApolloError) {
        // Get message from GraphQL error if available
        if (err.graphQLErrors && err.graphQLErrors.length > 0) {
          errorMessage = err.graphQLErrors[0].message || errorMessage;
        } else if (err.message) {
          errorMessage = err.message;
        }
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    }
  };

  return (
    <RegistrationCard
      handleSubmit={handleSubmit}
      isLoading={isLoading}
      error={error}
    />
  );
}
