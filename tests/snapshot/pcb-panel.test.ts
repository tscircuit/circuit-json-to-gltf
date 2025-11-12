import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import type { CircuitJson } from "circuit-json"

test("pcb-panel-snapshot", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_panel",
      pcb_panel_id: "panel_0",
      width: 100,
      height: 100,
    },
    {
      type: "pcb_board",
      pcb_board_id: "board_0",
      center: { x: -25, y: 25 },
      width: 40,
      height: 40,
      thickness: 1.6,
      material: "fr4",
      num_layers: 2,
    },
    {
      type: "pcb_board",
      pcb_board_id: "board_1",
      center: { x: 25, y: 25 },
      width: 40,
      height: 40,
      thickness: 1.6,
      material: "fr4",
      num_layers: 2,
    },
    {
      type: "pcb_board",
      pcb_board_id: "board_2",
      center: { x: -25, y: -25 },
      width: 40,
      height: 40,
      thickness: 1.6,
      material: "fr4",
      num_layers: 2,
    },
    {
      type: "pcb_board",
      pcb_board_id: "board_3",
      center: { x: 25, y: -25 },
      width: 40,
      height: 40,
      thickness: 1.6,
      material: "fr4",
      num_layers: 2,
    },
  ] as any

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
  const cameraOptions = getBestCameraPosition(circuitJson)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path)
})
