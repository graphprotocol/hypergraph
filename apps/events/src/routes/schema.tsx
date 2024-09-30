import { SchemaTestYjs } from "@/components/schema-test-yjs";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/schema")({
  component: () => (
    <div className="flex flex-1 justify-center items-center flex-col gap-4">
      {/* <SchemaTestAutomerge /> */}
      <SchemaTestYjs />
    </div>
  ),
});
