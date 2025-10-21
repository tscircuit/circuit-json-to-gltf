import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import type { CircuitJson } from "circuit-json"

test("silkscreen-text-snapshot", async () => {
  // Create a simple circuit with just a board and silkscreen text
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 0, y: 0 },
      width: 10,
      height: 10,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "text1",
      pcb_component_id: "board1",
      anchor_alignment: "center",
      anchor_position: { x: 0, y: 2 },
      font: "tscircuit2024",
      font_size: 1.2,
      layer: "top",
      text: "HELLO",
      ccw_rotation: 0,
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "text2",
      pcb_component_id: "board1",
      anchor_alignment: "center",
      anchor_position: { x: 0, y: 0 },
      font: "tscircuit2024",
      font_size: 0.8,
      layer: "top",
      text: "TEXTURE TEST",
      ccw_rotation: 0,
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "text3",
      pcb_component_id: "board1",
      anchor_alignment: "center",
      anchor_position: { x: 0, y: -2 },
      font: "tscircuit2024",
      font_size: 0.6,
      layer: "top",
      text: "0123456789",
      ccw_rotation: 0,
    },
  ]

  // Convert circuit to GLTF (GLB format for rendering)
  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 1024,
    includeModels: false,
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
