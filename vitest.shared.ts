import * as path from 'node:path';
import type { ViteUserConfig } from 'vitest/config';

// This is a workaround, see https://github.com/vitest-dev/vitest/issues/4744
const config: ViteUserConfig = {
  test: {
    alias: {
      '@graphprotocol/hypergraph/test': path.join(__dirname, 'packages', 'hypergraph', 'test'),
      '@graphprotocol/hypergraph': path.join(__dirname, 'packages', 'hypergraph', 'src'),
    },
  },
};

export default config;
