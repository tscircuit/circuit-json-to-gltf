import { expect, test } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import type { CircuitJson } from "circuit-json"
import * as fs from "node:fs"
import * as path from "node:path"

const fixturePath = path.join(
  __dirname,
  "../fixtures/bottom-layer-circuit.json",
)

test("bottom-layer-components-visual-regression", async () => {
  const circuitData = fs.readFileSync(fixturePath, "utf-8")
  const circuitJson: CircuitJson = JSON.parse(circuitData)

  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 256,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  const cameraOptions = {
    camPos: [0, -35, 25] as const,
    lookAt: [0, 0, 0] as const,
  }

  const pngBuffer = await renderGLTFToPNGBufferFromGLBBuffer(
    glbResult as ArrayBuffer,
    cameraOptions,
  )

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path, "bottom-layer-components")
})
