import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['./packages/*', './apps/events', './apps/typesync', './apps/create-hypergraph-app'],
  },
});
