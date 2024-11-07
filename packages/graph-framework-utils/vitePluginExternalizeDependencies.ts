import fs from 'node:fs/promises';
import path from 'node:path';
import escapeStringRegexp from 'escape-string-regexp';
import type { Plugin } from 'vite';

/**
 * Vite plugin to automatically externalize all `dependencies` and `peerDependencies` of the package.
 * Note that `devDependencies` are not externalized, since they shouldn't even be present in a consumer's dependency tree.
 * If any bit of a dev dependency makes it into the final bundle, it will be inlined (but it really shouldn't happen).
 */
export function vitePluginExternalizeDependencies(): Plugin {
  return {
    name: 'vite-plugin-externalize-dependencies',
    async config(config, { command }) {
      // Only run for the `build` command
      if (command !== 'build') return;

      const packageJsonPath = path.join(config.root ?? process.cwd(), 'package.json');
      try {
        await fs.access(packageJsonPath);
      } catch {
        console.error(`package.json not found at ${packageJsonPath}`);
        return;
      }

      let packageJson: {
        dependencies?: Record<string, string>;
        peerDependencies?: Record<string, string>;
      } = {};
      try {
        packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
      } catch (error) {
        console.error(`Failed to read or parse package.json at ${packageJsonPath}`, error);
        return;
      }

      config.build = config.build ?? {};
      config.build.rollupOptions = {
        ...config.build.rollupOptions,
        external: [
          ...Object.keys(packageJson.dependencies ?? {}),
          ...Object.keys(packageJson.peerDependencies ?? {}),
        ].map(
          // Match the exact dependency name and any path under it (except CSS files)
          (dependency) => new RegExp(`^${escapeStringRegexp(dependency)}(/(?!.*\\.css$).*)?$`),
        ),
      };

      return config;
    },
  };
}
