import { expect, test } from "bun:test"
import { transformMesh } from "../../lib/gltf/geometry"

test("zero mesh scale preserves collapsed positions and produces finite zero normals", () => {
  const result = transformMesh(
    { positions: [1, 2, 3], normals: [0, 0, 1], indices: [], texcoords: [] },
    { x: 7, y: 11, z: 13 },
    undefined,
    { x: 1, y: 1, z: 0 },
  )
  expect(result.positions).toEqual([8, 13, 13])
  expect(result.normals).toEqual([0, 0, 0])
})
