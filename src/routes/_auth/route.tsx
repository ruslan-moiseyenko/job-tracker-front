import { ModeToggle } from "@/components/common/ModeToggle";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout
});

function AuthLayout() {
  return (
    <div className="flex flex-col items-center justify-center h-screen min-h-screen w-full bg-[url('/src/assets/img/laptop.webp')] bg-cover bg-center">
      <div className="absolute top-5 right-5 z-10">
        <ModeToggle />
      </div>
      <div className="absolute inset-0 bg-black/50 z-0" />
      <div className={` relative z-10`}>
        <Outlet />
      </div>
    </div>
  );
}
