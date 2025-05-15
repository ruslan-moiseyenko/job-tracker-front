import { Route } from "@/routes/__root";
import { Link, Outlet } from "@tanstack/react-router";
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
              <Link to="/dashboard">Дашборд</Link>
            </li>
            <li>
              <Link to="/panel">Панель</Link>
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
