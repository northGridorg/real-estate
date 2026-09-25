import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/deal")({
  component: () => <Outlet />,
});
