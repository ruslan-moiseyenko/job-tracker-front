import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@apollo/client";
import { GET_ME_QUERY } from "@/auth/queries";
import type { IMeQueryResponse } from "@/auth/types";

export const Route = createFileRoute("/_protected/panel")({
  component: PanelPage
});

function PanelPage() {
  // Пример использования Apollo для получения данных пользователя
  const { data, loading, error } = useQuery<IMeQueryResponse>(GET_ME_QUERY);

  if (loading) return <div>Загрузка данных...</div>;
  if (error) return <div>Ошибка: {error.message}</div>;

  return (
    <div>
      <h1>Панель управления</h1>
      <p>Добро пожаловать в панель управления!</p>

      {data && data.me && (
        <div className="user-details">
          <h2>Ваши данные:</h2>
          <p>ID: {data.me.id}</p>
          <p>Email: {data.me.email}</p>
          <p>Имя: {data.me.firstName + " " + data.me.lastName}</p>
        </div>
      )}
    </div>
  );
}
