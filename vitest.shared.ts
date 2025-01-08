import * as path from 'node:path';
import type { ViteUserConfig } from 'vitest/config';

const graphFrameworkAlias = {
  '@graphprotocol/graph-framework/test': path.join(__dirname, 'packages', 'graph-framework', 'test'),
  '@graphprotocol/graph-framework': path.join(__dirname, 'packages', 'graph-framework', 'src'),
};

const graphFrameworkPkgAlias = (name: string) => {
  return {
    [`@graph-framework/${name}/test`]: path.join(__dirname, 'packages', `graph-framework-${name}`, 'test'),
    [`@graph-framework/${name}`]: path.join(__dirname, 'packages', `graph-framework-${name}`, 'src'),
  };
};

// This is a workaround, see https://github.com/vitest-dev/vitest/issues/4744
const config: ViteUserConfig = {
  test: {
    alias: {
      ...graphFrameworkAlias,
      ...graphFrameworkPkgAlias('utils'),
      ...graphFrameworkPkgAlias('space-events'),
      ...graphFrameworkPkgAlias('schema'),
      ...graphFrameworkPkgAlias('identity'),
      ...graphFrameworkPkgAlias('key'),
      ...graphFrameworkPkgAlias('messages'),
    },
  },
};

export default config;
