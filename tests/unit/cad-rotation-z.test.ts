import { expect, test } from "bun:test"
import { placeCadRotationProbe } from "../fixtures/cad-rotation-probe"

test("CAD Z keeps its existing counterclockwise PCB rotation", () => {
  const mesh = placeCadRotationProbe({ x: 0, y: Math.PI / 2, z: 0 })
  expect(mesh.positions[0]).toBeCloseTo(-5, 8)
  expect(mesh.positions[1]).toBeCloseTo(8, 8)
  expect(mesh.positions[2]).toBeCloseTo(-10, 8)
  expect(mesh.normals).toEqual([-0, 1, 0])
})
