import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5180,
  },
  plugins: [TanStackRouterVite(), react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@graphprotocol/hypergraph': path.resolve(__dirname, '../../packages/hypergraph/src'),
      '@graphprotocol/hypergraph-react': path.resolve(__dirname, '../../packages/hypergraph-react/src'),
    },
  },
});
