import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./packages/graph-framework-utils/vite.config.mts",
  "./packages/graph-framework-space-events/vite.config.mts",
  "./packages/graph-framework-schema/vite.config.mts",
  "./packages/graph-framework-identity/vite.config.mts",
  "./packages/graph-framework/vite.config.mts",
  "./apps/events/vite.config.ts",
]);
