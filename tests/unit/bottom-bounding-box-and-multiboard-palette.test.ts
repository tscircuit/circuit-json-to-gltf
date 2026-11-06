import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"

test("showBoundingBoxes places bottom-layer bounding box flush with bottom board surface", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 0, y: 0 },
      width: 20,
      height: 20,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    {
      type: "source_component",
      source_component_id: "src_top",
      name: "U_TOP",
      ftype: "simple_chip",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_top",
      source_component_id: "src_top",
      center: { x: -4, y: 0 },
      width: 4,
      height: 4,
      layer: "top",
      rotation: 0,
      obstructs_within_bounds: true,
    },
    {
      type: "cad_component",
      cad_component_id: "cad_top",
      pcb_component_id: "pcb_top",
      source_component_id: "src_top",
      position: { x: -4, y: 0, z: 0 },
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
      show_as_bounding_box: true,
    },
    {
      type: "source_component",
      source_component_id: "src_bottom",
      name: "U_BOT",
      ftype: "simple_chip",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_bottom",
      source_component_id: "src_bottom",
      center: { x: 4, y: 0 },
      width: 4,
      height: 4,
      layer: "bottom",
      rotation: 0,
      obstructs_within_bounds: true,
    },
    {
      type: "cad_component",
      cad_component_id: "cad_bottom",
      pcb_component_id: "pcb_bottom",
      source_component_id: "src_bottom",
      position: { x: 4, y: 0, z: 0 },
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
      show_as_bounding_box: true,
    },
  ]

  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
    showBoundingBoxes: true,
    defaultComponentHeight: 2,
  })

  const topBox = scene.boxes.find((b) => b.label === "U_TOP")
  const bottomBox = scene.boxes.find((b) => b.label === "U_BOT")

  expect(topBox).toBeDefined()
  expect(bottomBox).toBeDefined()
  // Board thickness is 1.6 (extends from -0.8 to +0.8), component height is 2 (half-height 1.0)
  expect(topBox?.center.y).toBeCloseTo(1.8, 5)
  expect(bottomBox?.center.y).toBeCloseTo(-1.8, 5)
})

test("multi-board scenes resolve per-board solder_mask_color and material palette", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board_green",
      center: { x: -15, y: 0 },
      width: 10,
      height: 10,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
      solder_mask_color: "green",
    } as any,
    {
      type: "pcb_board",
      pcb_board_id: "board_blue",
      center: { x: 15, y: 0 },
      width: 10,
      height: 10,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
      solder_mask_color: "blue",
    } as any,
  ]

  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
  })

  expect(scene.boxes).toHaveLength(2)
  const greenBoard = scene.boxes.find((b) => b.center.x === -15)
  const blueBoard = scene.boxes.find((b) => b.center.x === 15)

  expect(greenBoard?.color).toBe("#0f4f30")
  expect(blueBoard?.color).toBe("#173f68")
  expect(greenBoard?.sideColor).not.toBe(blueBoard?.sideColor)
})
