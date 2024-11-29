import path from 'node:path';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import topLevelAwait from 'vite-plugin-top-level-await';
import wasm from 'vite-plugin-wasm';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
    topLevelAwait(),
    TanStackRouterVite(),
    react(),
    nodePolyfills({
      globals: {
        Buffer: true,
        global: true,
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@graphprotocol/graph-framework': path.resolve(__dirname, '../../packages/graph-framework/src'),
      '@graph-framework/space-events': path.resolve(__dirname, '../../packages/graph-framework-space-events/src'),
      '@graph-framework/utils': path.resolve(__dirname, '../../packages/graph-framework-utils/src'),
      '@graph-framework/schema': path.resolve(__dirname, '../../packages/graph-framework-schema/src'),
      '@graph-framework/identity': path.resolve(__dirname, '../../packages/graph-framework-identity/src'),
      '@graph-framework/key': path.resolve(__dirname, '../../packages/graph-framework-key/src'),
      '@graph-framework/messages': path.resolve(__dirname, '../../packages/graph-framework-messages/src'),
    },
  },
});
