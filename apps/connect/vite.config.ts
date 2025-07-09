import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import unfonts from 'unplugin-fonts/vite';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import svgr from 'vite-plugin-svgr';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 5180,
  },
  plugins: [
    nodePolyfills({
      protocolImports: true,
      globals: {
        Buffer: true,
      },
      include: ['buffer'],
    }),
    TanStackRouterVite(),
    react(),
    tailwindcss(),
    unfonts({
      custom: {
        display: 'swap',
        families: { Calibre: { src: './src/assets/fonts/Calibre*' } },
      },
    }),
    svgr(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@graphprotocol/hypergraph': path.resolve(__dirname, '../../packages/hypergraph/src'),
      '@graphprotocol/hypergraph-react': path.resolve(__dirname, '../../packages/hypergraph-react/src'),
    },
  },
});
