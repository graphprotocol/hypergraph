import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import 'react';
import 'react-dom';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      quoteStyle: 'single',
      autoCodeSplitting: true,
      semicolons: true,
    }),
    viteReact(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@graphprotocol/hypergraph': resolve(__dirname, '../src'),
      '@graphprotocol/hypergraph-react': resolve(__dirname, '../../hypergraph-react/src'),
    },
  },
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
});
