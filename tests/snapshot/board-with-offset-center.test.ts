import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import type { CircuitJson } from "circuit-json"

test("board-with-offset-center - verify board at (0,0,0) with offset center", async () => {
  // This is the visual snapshot test for issue #46
  // Board has center at (25, 15) in PCB coordinates
  // But it should be rendered at (0,0,0) in 3D space
  // Components should be offset relative to board center
  
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 25, y: 15 },
      width: 50,
      height: 30,
      thickness: 1.6,
    },
    {
      type: "pcb_component",
      pcb_component_id: "comp_center",
      source_component_id: "src_center",
      center: { x: 25, y: 15 }, // At the board center
      width: 6,
      height: 6,
      layer: "top",
    },
    {
      type: "pcb_component",
      pcb_component_id: "comp_tr",
      source_component_id: "src_tr",
      center: { x: 40, y: 25 }, // Top-right from center
      width: 4,
      height: 4,
      layer: "top",
    },
    {
      type: "pcb_component",
      pcb_component_id: "comp_bl",
      source_component_id: "src_bl",
      center: { x: 10, y: 5 }, // Bottom-left from center
      width: 4,
      height: 4,
      layer: "top",
    },
    {
      type: "source_component",
      source_component_id: "src_center",
      name: "CENTER",
    },
    {
      type: "source_component",
      source_component_id: "src_tr",
      name: "TR",
    },
    {
      type: "source_component",
      source_component_id: "src_bl",
      name: "BL",
    },
  ]

  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: false,
  })

  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  // Camera looking at origin where the board should be positioned
  const cameraOptions = {
    camPos: [60, 45, 50] as const,
    lookAt: [0, 0, 0] as const,
  }

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(
      glbResult as ArrayBuffer,
      cameraOptions,
    ),
  ).toMatchPngSnapshot(import.meta.path)
})
