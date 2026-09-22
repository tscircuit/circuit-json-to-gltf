import { expect, test } from "bun:test"

test("browser bundlers do not resolve the optional native SVG addon", async () => {
  // board-renderer references this module even though browsers use the WASM
  // renderer. Bundling that graph must not try to load a platform .node binary.
  const result = await Bun.build({
    entrypoints: [
      new URL("../lib/utils/svg-to-png.ts", import.meta.url).pathname,
    ],
    target: "browser",
    external: ["fs", "os", "path"],
  })
  expect(result.success).toBe(true)
  expect(result.outputs).toHaveLength(1)
})
