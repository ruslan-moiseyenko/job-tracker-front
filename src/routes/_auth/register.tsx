import { RegistrationCard } from "@/auth/components/RegistrationCard";
import type { IRegisterInput } from "@/auth/types";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

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
      console.log("🚀 ~ RegisterPage, handleSubmit ~ err:", err);
      setError(
        "Registration failed. Please check your information and try again."
      );
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
