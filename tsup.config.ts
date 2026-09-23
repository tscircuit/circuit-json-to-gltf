import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["lib/index.ts"],
  format: ["esm"],
  dts: { resolve: ["@tscircuit/flex-utils"] },
  outDir: "dist",
  noExternal: ["@jscad/modeling", "@tscircuit/flex-utils"],
})
