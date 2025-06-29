import { globSync } from 'glob';
import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    bin: './src/bin.ts',
    ...Object.fromEntries(
      globSync('./src/migrations/*.ts').map((file) => [
        `migrations/${file.split('/').pop()?.replace('.ts', '')}`,
        file,
      ]),
    ),
  },
  clean: true,
  publicDir: true,
  treeshake: 'smallest',
  external: ['@parcel/watcher'],
  target: 'node22',
  platform: 'node',
  format: 'esm',
  splitting: false,
  outDir: 'dist',
  // this fixes an issue with dynamic require in the esm output
  banner() {
    return {
      js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`,
    };
  },
});
