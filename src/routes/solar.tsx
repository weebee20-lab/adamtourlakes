import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/solar")({
  component: SolarLayout,
});

function SolarLayout() {
  return <Outlet />;
}
