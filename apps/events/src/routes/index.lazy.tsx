import { createLazyFileRoute } from "@tanstack/react-router";
import { hello } from "graph-framework";

export const Route = createLazyFileRoute("/")({
  component: Index,
});

export function Index() {
  return (
    <>
      <p>{hello()}</p>
    </>
  );
}
