import { test, expect } from "bun:test"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import type { CircuitJson } from "circuit-json"

test("pcb-copper-pour-snapshot", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 0, y: 0 },
      width: 20,
      height: 20,
      thickness: 1.6,
      material: "fr4",
      num_layers: 2,
    },
    {
      type: "pcb_copper_pour",
      pcb_copper_pour_id: "pour1",
      shape: "rect",
      layer: "top",
      covered_with_solder_mask: false,
      center: { x: 0, y: 0 },
      width: 18,
      height: 18,
    },
    {
      type: "pcb_copper_pour",
      pcb_copper_pour_id: "pour2",
      shape: "polygon",
      layer: "bottom",
      covered_with_solder_mask: true,
      points: [
        { x: 0, y: 5 },
        { x: -5, y: 5 },
        { x: -5, y: 9 },
        { x: 0, y: 9 },
      ],
    },
  ]

  // Convert circuit to GLTF (GLB format for rendering)
  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: false,
    showBoundingBoxes: false,
  })

  // Ensure we got a valid GLB buffer
  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  // Render the GLB to PNG with camera position derived from circuit dimensions
  const cameraOptions = getBestCameraPosition(circuitJson)

  // TOP VIEW
  expect(
    renderGLTFToPNGFromGLB(glbResult as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path, "copper-pour-top")

  // BOTTOM VIEW
  const bottomCameraOptions = {
    ...cameraOptions,
    camPos: [
      cameraOptions.camPos[0],
      -cameraOptions.camPos[1],
      cameraOptions.camPos[2],
    ] as const,
  }
  expect(
    renderGLTFToPNGFromGLB(
      glbResult as ArrayBuffer,
      bottomCameraOptions,
    ),
  ).toMatchPngSnapshot(import.meta.path, "copper-pour-bottom")
})
