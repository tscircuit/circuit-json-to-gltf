import { test, expect } from "bun:test"
import type {
  CircuitJson,
  PcbBoard,
  PcbHole,
  PCBPlatedHole,
} from "circuit-json"
import { createBoardMesh } from "../../lib/utils/pcb-board-geometry"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"

const triangleArea = (
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  c: { x: number; y: number; z: number },
): number => {
  const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
  const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
  const cross = {
    x: ab.y * ac.z - ab.z * ac.y,
    y: ab.z * ac.x - ab.x * ac.z,
    z: ab.x * ac.y - ab.y * ac.x,
  }
  const magnitude = Math.sqrt(cross.x ** 2 + cross.y ** 2 + cross.z ** 2)
  return 0.5 * magnitude
}

test("createBoardMesh subtracts drilled and plated holes", () => {
  const drilledDiameter = 2
  const platedHoleDiameter = 1.2

  const board: PcbBoard = {
    type: "pcb_board",
    pcb_board_id: "board1",
    center: { x: 10, y: 5 },
    width: 20,
    height: 10,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
    outline: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 0, y: 10 },
    ],
  }

  const holes: PcbHole[] = [
    {
      type: "pcb_hole",
      pcb_hole_id: "hole1",
      x: 10,
      y: 5,
      hole_diameter: drilledDiameter,
      hole_shape: "circle",
    },
  ]

  const platedHoles: PCBPlatedHole[] = [
    {
      type: "pcb_plated_hole",
      pcb_plated_hole_id: "ph1",
      x: 14,
      y: 6,
      hole_diameter: platedHoleDiameter,
      outer_diameter: 2,
      shape: "circle",
      layers: ["top", "bottom"],
    },
  ]

  const mesh = createBoardMesh(board, {
    thickness: board.thickness ?? 1.6,
    holes,
    platedHoles,
  })

  expect(mesh.triangles.length).toBeGreaterThan(0)
  expect(mesh.boundingBox.min.y).toBeCloseTo(-(board.thickness ?? 1.6) / 2, 6)
  expect(mesh.boundingBox.max.y).toBeCloseTo((board.thickness ?? 1.6) / 2, 6)

  const topArea = mesh.triangles
    .filter((triangle) => triangle.normal.y > 0.9)
    .reduce((sum, triangle) => {
      const [a, b, c] = triangle.vertices
      return sum + triangleArea(a, b, c)
    }, 0)

  const outlineArea = board.width! * board.height!
  const drilledArea = Math.PI * (drilledDiameter / 2) ** 2
  const platedArea = Math.PI * (platedHoleDiameter / 2) ** 2
  const expectedArea = outlineArea - drilledArea - platedArea

  expect(topArea).toBeCloseTo(expectedArea, 1)
})
test("convertCircuitJsonTo3D includes board mesh for outline boards", async () => {
  const board: PcbBoard = {
    type: "pcb_board",
    pcb_board_id: "board_outline",
    center: { x: 5, y: -5 },
    width: 12,
    height: 8,
    thickness: 1.2,
    num_layers: 2,
    material: "fr4",
    outline: [
      { x: 0, y: -4 },
      { x: 12, y: -4 },
      { x: 12, y: 4 },
      { x: 3, y: 4 },
      { x: 0, y: 1 },
    ],
  }

  const platedHoles: PCBPlatedHole[] = [
    {
      type: "pcb_plated_hole",
      pcb_plated_hole_id: "outline_via",
      x: 6,
      y: -1,
      hole_diameter: 0.8,
      outer_diameter: 1.4,
      shape: "circle",
      layers: ["top", "bottom"],
    },
  ]

  const circuit: CircuitJson = [board, ...platedHoles]

  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })

  const boardBox = scene.boxes[0]!
  expect(boardBox.mesh).toBeDefined()
  expect(boardBox.mesh?.triangles.length ?? 0).toBeGreaterThan(0)
  expect(boardBox.center).toEqual({
    x: board.center.x,
    y: 0,
    z: board.center.y,
  })
  expect(boardBox.size.y).toBeCloseTo(board.thickness ?? 1.2, 6)
})
