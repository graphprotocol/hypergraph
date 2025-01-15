import * as path from 'node:path';
import type { ViteUserConfig } from 'vitest/config';

const alias = (dir: string, name = `@graphprotocol/${dir}`) => ({
  [`${name}/test`]: path.join(__dirname, 'packages', dir, 'test'),
  [`${name}`]: path.join(__dirname, 'packages', dir, 'src'),
});

const config: ViteUserConfig = {
  test: {
    alias: {
      ...alias('hypergraph'),
    },
  },
};

export default config;
