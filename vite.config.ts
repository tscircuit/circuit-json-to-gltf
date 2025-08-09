import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

export default defineConfig({
  plugins: [react()],
  root: "site",
  build: {
    outDir: "../dist",
  },
  resolve: {
    alias: {
      "../lib": resolve(__dirname, "./lib"),
    },
  },
  optimizeDeps: {
    exclude: ["@resvg/resvg-js", "@resvg/resvg-wasm"],
  },
  assetsInclude: ["**/*.wasm"],
})
