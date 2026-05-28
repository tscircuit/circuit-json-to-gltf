// Standalone bundle for the EnergyCitizen runframe override —
// inlines every dependency so the browser can `import()` it without
// chasing a tree of nested CDN requests.

import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["esm"],
  dts: false,
  outDir: "dist-standalone",
  noExternal: [/.*/],
  splitting: false,
  treeshake: true,
  platform: "browser",
  external: ["@resvg/resvg-js"],
})
