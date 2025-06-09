import { defineConfig } from 'tsup';

export default defineConfig(() => ({
  entry: ['src/index.ts'],
  format: ['cjs'],
  clean: true,
  sourcemap: true,
  external: [
    '@prisma/client',
    '../generated/client',
    '../generated/client/*',
    'node:fs',
    'node:path',
    'node:os',
    'node:crypto',
    'node:util',
    'node:stream',
    'node:url',
  ],
}));
