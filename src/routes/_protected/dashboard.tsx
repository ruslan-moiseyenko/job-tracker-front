import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_protected/dashboard")({
  component: DashboardPage
});

function DashboardPage() {
  return (
    <div>
      <h1>Дашборд</h1>
      <p>Здесь находится дашборд приложения с важной информацией.</p>
    </div>
  );
}
