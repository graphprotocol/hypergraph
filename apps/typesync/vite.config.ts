import tailwindcss from '@tailwindcss/vite';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

import 'react';
import 'react-dom';

export default defineConfig({
  root: './client',
  // server: {
  //   port: 3000,
  // },
  // preview: {
  //   port: 5000,
  // },
  plugins: [TanStackRouterVite({ autoCodeSplitting: true }), react(), tailwindcss()],
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
});
