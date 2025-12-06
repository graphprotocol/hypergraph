import react from '@vitejs/plugin-react';
import { mergeConfig, type UserConfigExport } from 'vitest/config';

import shared from '../../vitest.shared.js';

const config: UserConfigExport = {
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['test/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['build/**', 'dist/**', 'publish/**', 'node_modules/**'],
  },
};

export default mergeConfig(shared, config);
