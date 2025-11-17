import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import type { CircuitJson } from "circuit-json"

test("pcb-panel-snapshot", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_panel",
      pcb_panel_id: "panel1",
      width: 130,
      height: 70,
      center: { x: 0, y: 0 },
      covered_with_solder_mask: true,
    },
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      pcb_panel_id: "panel1",
      width: 40,
      height: 25,
      center: { x: -25, y: 0 },
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    {
      type: "pcb_board",
      pcb_board_id: "board2",
      pcb_panel_id: "panel1",
      width: 40,
      height: 25,
      center: { x: 25, y: 0 },
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad1",
      pcb_component_id: "comp1",
      pcb_port_id: "port1",
      shape: "rect",
      x: -25,
      y: 5,
      width: 1,
      height: 1,
      layer: "top",
    },
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad2",
      pcb_component_id: "comp2",
      pcb_port_id: "port2",
      shape: "rect",
      x: 25,
      y: 5,
      width: 1,
      height: 1,
      layer: "top",
    },
    // Silkscreen outline for first board
    {
      type: "pcb_silkscreen_path",
      pcb_silkscreen_path_id: "outline1_top",
      pcb_component_id: "comp1",
      layer: "top",
      route: [
        { x: -44.5, y: -12 },
        { x: -5.5, y: -12 },
        { x: -5.5, y: 12 },
        { x: -44.5, y: 12 },
        { x: -44.5, y: -12 },
      ],
      stroke_width: 0.15,
    },
    // Silkscreen text label for board 1
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "text1",
      pcb_component_id: "comp1",
      text: "BOARD 1",
      layer: "top",
      anchor_position: { x: -25, y: 0 },
      anchor_alignment: "center",
      font_size: 2,
      font: "tscircuit2024",
    },
    // Silkscreen outline for second board
    {
      type: "pcb_silkscreen_path",
      pcb_silkscreen_path_id: "outline2_top",
      pcb_component_id: "comp2",
      layer: "top",
      route: [
        { x: 5.5, y: -12 },
        { x: 44.5, y: -12 },
        { x: 44.5, y: 12 },
        { x: 5.5, y: 12 },
        { x: 5.5, y: -12 },
      ],
      stroke_width: 0.15,
    },
    // Silkscreen text label for board 2
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "text2",
      pcb_component_id: "comp2",
      text: "BOARD 2",
      layer: "top",
      anchor_position: { x: 25, y: 0 },
      anchor_alignment: "center",
      font_size: 2,
      font: "tscircuit2024",
    },
  ]

  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
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
  ).toMatchPngSnapshot(import.meta.path, "pcb-panel")
})
