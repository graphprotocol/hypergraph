import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vitest/config';

import shared from '../../vitest.shared.js';

const config = {
  plugins: [react()],
  test: {
    environment: 'jsdom',
  },
};

export default mergeConfig(shared, config);
