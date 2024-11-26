import react from '@vitejs/plugin-react';

import { type UserConfigExport, mergeConfig } from 'vitest/config';
import shared from '../../vitest.shared.js';

const config: UserConfigExport = {
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
};

export default mergeConfig(shared, config);
