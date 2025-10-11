import { test, expect } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"

test("reproducer: convertCircuitJsonTo3D currently uses pcb_board.center as board position instead of centering at (0,0,0)", async () => {
  // Create a circuit with board center NOT at (0,0)
  // This demonstrates the bug: boards should always be centered at origin
  // regardless of their `center` property value
  const circuitJsonWithOffsetBoard = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 25, y: 15 }, // Board center is at (25, 15), not (0,0)
      width: 50,
      height: 30,
      thickness: 1.6,
    },
    {
      type: "pcb_component",
      pcb_component_id: "comp1",
      source_component_id: "src1",
      center: { x: 15, y: 10 }, // Positioned relative to board center
      width: 8,
      height: 6,
      layer: "top",
    },
    {
      type: "source_component",
      source_component_id: "src1",
      name: "R1",
      display_value: "10k",
    },
  ]

  const scene = await convertCircuitJsonTo3D(circuitJsonWithOffsetBoard as any)

  expect(scene).toBeDefined()
  expect(scene.boxes).toBeInstanceOf(Array)
  expect(scene.boxes.length).toBeGreaterThan(0)

  // Currently the bug: boards are positioned at their `center` coordinates instead of (0,0,0)
  const boardBox = scene.boxes.find((box) => box.size?.y === 1.6)
  expect(boardBox).toBeDefined()
  // These expectations document the current (buggy) behavior
  expect(boardBox?.center.x).toBe(25) // Bug: positioned at board.center.x instead of 0
  expect(boardBox?.center.z).toBe(15) // Bug: positioned at board.center.y instead of 0
})
