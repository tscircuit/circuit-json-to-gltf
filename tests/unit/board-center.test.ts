import { test, expect } from "bun:test"
import type { CircuitJson, PcbBoard } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"

test("board without explicit center should default to (0,0)", async () => {
  // Create a board without a center property
  const board: PcbBoard = {
    type: "pcb_board",
    pcb_board_id: "board_no_center",
    width: 20,
    height: 10,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  } as any // Use 'as any' to bypass type checking for missing center

  const circuit: CircuitJson = [board]

  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })

  const boardBox = scene.boxes[0]!
  expect(boardBox).toBeDefined()
  expect(boardBox.center).toBeDefined()

  // (0,0) should be at the center
  expect(boardBox.center.x).toBe(0)
  expect(boardBox.center.z).toBe(0)
  expect(boardBox.center.y).toBe(0)
})

test("board with explicit center should still be positioned at (0,0,0)", async () => {
  const board: PcbBoard = {
    type: "pcb_board",
    pcb_board_id: "board_with_center",
    center: { x: 10, y: 5 },
    width: 20,
    height: 10,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  }

  const circuit: CircuitJson = [board]

  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })

  const boardBox = scene.boxes[0]!
  expect(boardBox).toBeDefined()

  // Board is ALWAYS at (0,0,0) in 3D space, regardless of board.center
  // board.center is used for PCB coordinate system, not 3D positioning
  expect(boardBox.center.x).toBe(0)
  expect(boardBox.center.z).toBe(0)
  expect(boardBox.center.y).toBe(0)
})

test("board with outline but no center should default to (0,0)", async () => {
  const board: PcbBoard = {
    type: "pcb_board",
    pcb_board_id: "board_outline_no_center",
    width: 12,
    height: 8,
    thickness: 1.2,
    num_layers: 2,
    material: "fr4",
    outline: [
      { x: -6, y: -4 },
      { x: 6, y: -4 },
      { x: 6, y: 4 },
      { x: -6, y: 4 },
    ],
  } as any

  const circuit: CircuitJson = [board]

  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })

  const boardBox = scene.boxes[0]!
  expect(boardBox).toBeDefined()

  // (0,0) should be at the center
  expect(boardBox.center.x).toBe(0)
  expect(boardBox.center.z).toBe(0)
  expect(boardBox.center.y).toBe(0)
})
