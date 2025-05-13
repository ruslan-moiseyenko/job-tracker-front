import { LoginCard } from "@/auth/components/LoginCard";
import type { ILoginInput } from "@/auth/types";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState } from "react";

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
      setError(null); // Clear previous errors
      await login(email, password);
      navigate({ to: "/panel" });
    } catch (err) {
      console.log("🚀 ~ LoginPage, handleSubmit ~ err:", err);
      setError("Invalid email or password. Please try again.");
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
