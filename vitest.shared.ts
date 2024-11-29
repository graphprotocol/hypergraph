import * as path from 'node:path';
import type { ViteUserConfig } from 'vitest/config';

const alias = (pkg: string, dir = pkg) => {
  const name = pkg === 'graph-framework' ? '@graphprotocol/graph-framework' : `@graph-framework/${pkg}`;

  return {
    [`${name}/test`]: path.join(__dirname, 'packages', dir, 'test'),
    [`${name}`]: path.join(__dirname, 'packages', dir, 'src'),
  };
};

// This is a workaround, see https://github.com/vitest-dev/vitest/issues/4744
const config: ViteUserConfig = {
  test: {
    alias: {
      ...alias('graph-framework'),
      ...alias('graph-framework-utils'),
      ...alias('graph-framework-space-events'),
      ...alias('graph-framework-schema'),
      ...alias('graph-framework-identity'),
      ...alias('graph-framework-key'),
      ...alias('graph-framework-messages'),
    },
  },
};

export default config;
