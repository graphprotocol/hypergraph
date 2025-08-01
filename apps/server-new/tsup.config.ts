import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  target: 'node22',
  clean: true,
  sourcemap: true,
  minify: false,
  splitting: false,
  dts: false,
  external: ['@prisma/client'],
});
