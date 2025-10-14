import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import * as fs from "node:fs"
import * as path from "node:path"
import type { CircuitJson } from "circuit-json"
import { getBestCameraPosition } from "../../lib/utils/camera-position"

test("footprinter-component-snapshot", async () => {
  const fixturePath = path.join(
    __dirname,
    "../fixtures/circuit-with-footprinter.json",
  )

  const circuitData = fs.readFileSync(fixturePath, "utf-8")
  const circuitJson: CircuitJson = JSON.parse(circuitData)

  // Ensure fetch is not needed for footprinter-generated models
  const originalFetch = globalThis.fetch
  type FetchPreconnect = typeof fetch extends { preconnect: infer P }
    ? P
    : never
  const failingFetch = ((..._args: Parameters<typeof fetch>) => {
    throw new Error("fetch should not be called for footprinter models")
  }) as unknown as typeof fetch
  failingFetch.preconnect = ((..._args: Parameters<FetchPreconnect>) => {
    throw new Error(
      "fetch.preconnect should not be called for footprinter models",
    )
  }) as unknown as FetchPreconnect
  globalThis.fetch = failingFetch

  try {
    const glbResult = await convertCircuitJsonToGltf(circuitJson, {
      format: "glb",
      boardTextureResolution: 512,
      includeModels: true,
    })

    expect(glbResult).toBeInstanceOf(ArrayBuffer)
    expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

    expect(
      renderGLTFToPNGBufferFromGLBBuffer(
        glbResult as ArrayBuffer,
        getBestCameraPosition(circuitJson),
      ),
    ).toMatchPngSnapshot(import.meta.path)
  } finally {
    globalThis.fetch = originalFetch
  }
})
