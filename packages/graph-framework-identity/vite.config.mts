import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

import { vitePluginExternalizeDependencies } from "../../shared/vitePluginExternalizeDependencies.js";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    dts({ tsconfigPath: "./tsconfig.build.json", insertTypesEntry: true }),
    vitePluginExternalizeDependencies(),
  ],
  build: {
    lib: {
      entry: {
        index: "./src/index.tsx",
      },
      formats: ["es"],
    },
  },
});
