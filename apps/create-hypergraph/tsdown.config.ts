import { defineConfig } from 'tsdown';

export default defineConfig(() => ({
  entry: ['src/bin.ts'],
  target: 'node20',
  minify: true,
  tsconfig: 'tsconfig.build.json',
  platform: 'node',
  format: 'esm',
  outDir: 'dist',
  clean: true,
  external: ['@parcel/watcher'],
  env: {
    NODE_ENV: 'production',
  },
}));
