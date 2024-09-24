import { Logout } from "@/components/logout";
import { isAuthenticated } from "@/lib/isAuthenticated";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { hello } from "graph-framework";

export const Route = createFileRoute("/")({
  component: Index,
  beforeLoad: () => {
    if (!isAuthenticated()) {
      throw redirect({
        to: "/login",
        search: {
          // Use the current location to power a redirect after login
          // (Do not use `router.state.resolvedLocation` as it can
          // potentially lag behind the actual current location)
          redirect: location.href,
        },
      });
    }
  },
});

export function Index() {
  return (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      <p>{hello()}</p>
      <Logout />
    </div>
  );
}
