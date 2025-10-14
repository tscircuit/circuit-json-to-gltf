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
})
