import { defineConfig } from "tsup"

export default defineConfig({
  entry: { index: "lib/index.ts", geometry: "lib/geometry/index.ts" },
  format: ["esm"],
  dts: { resolve: ["@tscircuit/flex-utils"] },
  outDir: "dist",
  noExternal: ["@jscad/modeling", "@tscircuit/flex-utils"],
})
