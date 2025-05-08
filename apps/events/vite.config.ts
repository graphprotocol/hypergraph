import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
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
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@graphprotocol/hypergraph': path.resolve(__dirname, '../../packages/hypergraph/src'),
      '@graphprotocol/hypergraph-react': path.resolve(__dirname, '../../packages/hypergraph-react/src'),
    },
  },
});
