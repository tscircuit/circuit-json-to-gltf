import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"

test("pcb-panel-cutouts", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_panel",
      pcb_panel_id: "panel1",
      width: 100,
      height: 80,
      center: { x: 0, y: 0 },
      covered_with_solder_mask: true,
    },
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      pcb_panel_id: "panel1",
      width: 30,
      height: 20,
      center: { x: 0, y: 0 },
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    // Rectangular cutout
    {
      type: "pcb_cutout",
      pcb_cutout_id: "cutout_rect",
      shape: "rect",
      center: { x: -30, y: 0 },
      width: 10,
      height: 15,
    },
    // Circular cutout
    {
      type: "pcb_cutout",
      pcb_cutout_id: "cutout_circle",
      shape: "circle",
      center: { x: 30, y: 20 },
      radius: 8,
    },
    // Polygon cutout (triangle)
    {
      type: "pcb_cutout",
      pcb_cutout_id: "cutout_polygon",
      shape: "polygon",
      points: [
        { x: 0, y: -30 },
        { x: -15, y: -15 },
        { x: 15, y: -15 },
      ],
    },
  ]

  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 256,
    includeModels: false,
    showBoundingBoxes: false,
  })

  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  const cameraOptions = getBestCameraPosition(circuitJson)
  const rotatedCameraOptions = {
    camPos: [
      -cameraOptions.camPos[0],
      cameraOptions.camPos[1],
      -cameraOptions.camPos[2],
    ] as const,
    lookAt: [
      -cameraOptions.lookAt[0],
      cameraOptions.lookAt[1],
      -cameraOptions.lookAt[2],
    ] as const,
  }

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(
      glbResult as ArrayBuffer,
      rotatedCameraOptions,
    ),
  ).toMatchPngSnapshot(import.meta.path, "pcb-panel-cutouts")
})
