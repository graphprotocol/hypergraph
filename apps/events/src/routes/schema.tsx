import { SchemaTestYjs } from "@/components/schema-test-yjs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/schema")({
  component: () => <SchemaTestYjs />,
});
