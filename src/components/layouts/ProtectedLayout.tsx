import { Route } from "@/routes/__root";
import { Outlet } from "@tanstack/react-router";
// import { Route as RootRoute } from "../../routes/__root";

export function ProtectedLayout() {
  const { auth } = Route.useRouteContext();

  return (
    <div className="auth-layout">
      <header>
        <div className="user-info">
          {auth.user && <span>Привет, {auth.user.firstName}!</span>}
        </div>
        <nav>
          <ul>
            <li>
              <a href="/dashboard">Дашборд</a>
            </li>
            <li>
              <a href="/panel">Панель</a>
            </li>
          </ul>
        </nav>
        <button onClick={() => auth.logout()}>Выйти</button>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
