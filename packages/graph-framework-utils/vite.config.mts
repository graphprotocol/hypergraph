import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import { vitePluginExternalizeDependencies } from "./vitePluginExternalizeDependencies.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({ tsconfigPath: "./tsconfig.build.json", insertTypesEntry: true }),
    vitePluginExternalizeDependencies(),
  ],
  build: {
    lib: {
      entry: {
        index: "./src/index.ts",
        base58: "./src/base58.ts",
      },
      formats: ["es", "cjs"],
      fileName(format, entryName) {
        return `${entryName}${format === "es" ? ".mjs" : ".cjs"}`;
      },
    },
  },
});
