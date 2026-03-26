import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import type { CircuitJson } from "circuit-json"
import * as fs from "node:fs"
import * as path from "node:path"

test("bottom-layer-components-bottom-view", async () => {
  const bottomLayerPath = path.join(
    __dirname,
    "../fixtures/bottom-layer-components.json",
  )

  const circuitData = fs.readFileSync(bottomLayerPath, "utf-8")
  const circuitJson: CircuitJson = JSON.parse(circuitData)

  // Convert circuit to GLTF (GLB format for rendering)
  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  // Ensure we got a valid GLB buffer
  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  // Custom camera to view from BELOW the board
  const cameraOptions = {
    position: { x: 15, y: -15, z: 15 }, // Position below and to the side
    target: { x: 0, y: 0, z: 0 }, // Look at board center
    up: "y+" as const,
    fov: 50,
    width: 800,
    height: 600,
  }

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path, "bottom-layer-components-bottom-view")
})
