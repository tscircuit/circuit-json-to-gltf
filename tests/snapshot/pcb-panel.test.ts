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
      covered_with_solder_mask: true,
    },
    {
      type: "pcb_board",
      pcb_board_id: "board_0",
      pcb_panel_id: "panel_0",
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
      pcb_panel_id: "panel_0",
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
      pcb_panel_id: "panel_0",
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
      pcb_panel_id: "panel_0",
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
  const panelThickness = (
    circuitJson.find((item) => item.type === "pcb_board") as
      | { thickness?: number }
      | undefined
  )?.thickness

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, {
      ...cameraOptions,
      width: 1024,
      height: 768,
      backgroundColor: [1, 1, 1],
      grid: {
        infiniteGrid: true,
        cellSize: 5,
        sectionSize: 25,
        fadeDistance: 120,
        fadeStrength: 1.2,
        gridColor: [0.88, 0.88, 0.88],
        sectionColor: [0.7, 0.7, 0.95],
        offset: {
          y: -((panelThickness ?? 1.6) / 2) - 0.05,
        },
      },
    }),
  ).toMatchPngSnapshot(import.meta.path)
})
