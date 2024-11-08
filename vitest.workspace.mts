import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
  './packages/graph-framework-utils/vitest.config.mts',
  './packages/graph-framework-space-events/vitest.config.mts',
  './packages/graph-framework-schema/vitest.config.mts',
  './packages/graph-framework-identity/vitest.config.mts',
  './packages/graph-framework/vitest.config.mts',
  './apps/events/vite.config.ts',
]);
