import { expect, test } from "bun:test"
import type { Triangle } from "../../lib/types"
import { transformTriangles } from "../../lib/utils/coordinate-transform"

test("winding parity composes reflected transforms without changing legacy vertex order or normals", () => {
  const triangle: Triangle = {
    vertices: [
      { x: 0, y: 0, z: 0 },
      { x: 1, y: 0, z: 0 },
      { x: 0, y: 1, z: 0 },
    ],
    normal: { x: 0, y: 0, z: 1 },
  }
  const swap = { axisMapping: { x: "x", y: "z", z: "y" } } as const
  const once = transformTriangles([triangle], swap)[0]!
  expect(once.windingReversed).toBe(true)
  expect(once.vertices[2]).toEqual({ x: 0, y: 0, z: 1 })
  expect(once.normal).toEqual({ x: 0, y: 1, z: 0 })
  const twice = transformTriangles([once], swap)[0]!
  expect(twice.windingReversed).toBe(false)
  expect(twice.vertices).toEqual(triangle.vertices)
  expect(twice.normal).toEqual(triangle.normal)
  const rotation = transformTriangles([once], {
    rotation: { x: 23, y: 61, z: -37 },
  })[0]!
  expect(rotation.windingReversed).toBe(true)
})
