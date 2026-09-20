import { expect, test } from "bun:test"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { rotateMesh, rotatePoint } from "../../lib/utils/mesh-scale"
import type { STLMesh } from "../../lib/types"

test("preparation retains sequential X then Y then Z degree rotations", () => {
  const rotation = { x: 90, y: 90, z: 90 }
  const point = { x: 2, y: 3, z: 5 }
  // X: (2,-5,3); Y: (3,-5,-2); Z: (5,3,-2).
  const expected = { x: 5, y: 3, z: -2 }
  const triangles: STLMesh["triangles"] = [
    {
      vertices: [point, { x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }],
      normal: { x: 0, y: 1, z: 0 },
    },
  ]
  const mesh = { triangles, boundingBox: boundsOfTriangles(triangles) }
  const result = rotateMesh(mesh, rotation)
  for (const actual of [
    rotatePoint(point, rotation),
    result.triangles[0]!.vertices[0],
  ]) {
    expect(actual.x).toBeCloseTo(expected.x, 10)
    expect(actual.y).toBeCloseTo(expected.y, 10)
    expect(actual.z).toBeCloseTo(expected.z, 10)
  }
  expect(result.boundingBox).toEqual(boundsOfTriangles(result.triangles))
})
