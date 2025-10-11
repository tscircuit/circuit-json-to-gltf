import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import * as fs from "node:fs"
import * as path from "node:path"
import type { CircuitJson } from "circuit-json"

test("circuit-with-offset-board-center-should-be-centered-at-origin", async () => {
  // Load the circuit with board center at (25,15) which should be positioned at origin (0,0) in 3D
  const circuitPath = path.join(
    __dirname,
    "../fixtures/circuit-with-offset-board-center.json",
  )

  const circuitData = fs.readFileSync(circuitPath, "utf-8")
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

  // Render the GLB to PNG with camera position derived from circuit dimensions
  // This snapshot will capture the current (buggy) behavior where the board is offset
  // After the fix is applied, this snapshot will change, proving the board is now centered
  const cameraOptions = getBestCameraPosition(circuitJson)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path)
})
