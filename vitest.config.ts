import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: ['./packages/*', './apps/events', './apps/connect', './apps/server', './apps/privy-login-example'],
  },
});
