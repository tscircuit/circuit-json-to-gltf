import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"

test("faux-board-soic8-chip", async () => {
  const circuit = new Circuit()

  // Add a SOIC8 chip without a board to test faux board creation
  circuit.add(
    <chip
      footprint="soic8"
      name="U1"
      cadModel={{
        glbUrl: "https://modelcdn.tscircuit.com/jscad_models/soic8.glb",
      }}
    />,
  )

  const circuitJson = await circuit.getCircuitJson()

  // Convert circuit to GLTF with faux board enabled
  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
    drawFauxBoard: true,
  })

  // Ensure we got a valid GLB buffer
  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  // Render the GLB to PNG with camera position derived from circuit dimensions
  const cameraOptions = getBestCameraPosition(circuitJson)

  const pngBuffer = await renderGLTFToPNGBufferFromGLBBuffer(
    glbResult as ArrayBuffer,
    cameraOptions,
  )

  expect(pngBuffer).toMatchPngSnapshot(import.meta.path)
})
