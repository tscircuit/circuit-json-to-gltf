import { test, expect } from "bun:test"
import type { CircuitJson, PcbBoard, PcbComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"

test("components should be positioned relative to board.center", async () => {
  // This is the real issue #46 test
  // Board center at (25, 15), component at (15, 10)
  // Component should be at (-10, -5) in 3D space

  const board: PcbBoard = {
    type: "pcb_board",
    pcb_board_id: "board1",
    center: { x: 25, y: 15 },
    width: 50,
    height: 30,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  }

  const component: PcbComponent = {
    type: "pcb_component",
    pcb_component_id: "comp1",
    source_component_id: "src1",
    center: { x: 15, y: 10 },
    width: 8,
    height: 6,
    layer: "top",
  }

  const sourceComponent = {
    type: "source_component" as const,
    source_component_id: "src1",
    name: "R1",
    display_value: "10k",
  }

  const circuit: CircuitJson = [board, component, sourceComponent]

  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })

  // Board should be at (0,0,0)
  const boardBox = scene.boxes.find((box) => box.size?.y === 1.6)
  expect(boardBox).toBeDefined()
  expect(boardBox?.center.x).toBe(0)
  expect(boardBox?.center.z).toBe(0)
  expect(boardBox?.center.y).toBe(0)

  // Component should be at relative position
  // PCB coords: component (15, 10), board center (25, 15)
  // Relative: (15-25, 10-15) = (-10, -5)
  // 3D coords: x=-10, z=-5
  const componentBox = scene.boxes.find((box) => box.label === "R1")
  expect(componentBox).toBeDefined()
  expect(componentBox?.center.x).toBe(-10)
  expect(componentBox?.center.z).toBe(-5)
})

test("components on board with no center should be positioned correctly", async () => {
  const board: PcbBoard = {
    type: "pcb_board",
    pcb_board_id: "board1",
    width: 50,
    height: 30,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  } as any // No center

  const component: PcbComponent = {
    type: "pcb_component",
    pcb_component_id: "comp1",
    source_component_id: "src1",
    center: { x: 10, y: 5 },
    width: 8,
    height: 6,
    layer: "top",
  }

  const sourceComponent = {
    type: "source_component" as const,
    source_component_id: "src1",
    name: "R1",
  }

  const circuit: CircuitJson = [board, component, sourceComponent]

  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })

  // Board should be at (0,0,0)
  const boardBox = scene.boxes.find((box) => box.size?.y === 1.6)
  expect(boardBox).toBeDefined()
  expect(boardBox?.center.x).toBe(0)
  expect(boardBox?.center.z).toBe(0)

  // Component should be at its PCB coords (since board center defaults to 0,0)
  const componentBox = scene.boxes.find((box) => box.label === "R1")
  expect(componentBox).toBeDefined()
  expect(componentBox?.center.x).toBe(10)
  expect(componentBox?.center.z).toBe(5)
})
