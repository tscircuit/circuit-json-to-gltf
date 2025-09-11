import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { resolve } from "path"

// Custom plugin to completely exclude problematic modules
const excludeNativeModulesPlugin = () => ({
  name: "exclude-native-modules",
  resolveId(id: string) {
    if (
      id.includes("@resvg/resvg-js") ||
      id.includes("resvgjs.darwin-arm64.node")
    ) {
      return { id: "virtual:empty", external: true }
    }
    return null
  },
  load(id: string) {
    if (id === "virtual:empty") {
      return "export default {};"
    }
    return null
  },
})

export default defineConfig({
  plugins: [react(), excludeNativeModulesPlugin()],
  build: {
    outDir: "../dist",
    rollupOptions: {
      external: [
        "@resvg/resvg-js",
        "@resvg/resvg-js-darwin-arm64",
        "fs",
        "path",
        "child_process",
      ],
    },
  },
  resolve: {
    alias: {
      "../lib": resolve(__dirname, "../lib/index"),
      // Always use browser version for site builds to avoid native dependency issues
      "../lib/utils/svg-to-png": resolve(
        __dirname,
        "../lib/utils/svg-to-png-browser",
      ),
    },
  },
  optimizeDeps: {
    exclude: ["@resvg/resvg-js", "@resvg/resvg-wasm"],
  },
  assetsInclude: ["**/*.wasm"],
})
