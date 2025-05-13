import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

export const Route = createFileRoute("/login")({
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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await auth.login(email, password);
      // После успешного входа перенаправляем на panel
      navigate({ to: "/panel" });
    } catch (err) {
      console.log("🚀 ~ handleSubmit ~ err:", err);
      setError("Неверный логин или пароль");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Вход в систему</h1>
      {error && <div className="error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Выполняется вход..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
