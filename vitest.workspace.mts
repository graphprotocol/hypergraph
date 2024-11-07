import { defineWorkspace } from "vitest/config";

export default defineWorkspace([
  "./packages/graph-framework-utils/vite.config.mts",
  "./packages/graph-framework-space-events/vite.config.js",
  "./packages/graph-framework-schema/vite.config.js",
  "./packages/graph-framework-identity/vite.config.js",
  "./packages/graph-framework/vite.config.js",
  "./apps/events/vite.config.ts",
]);
