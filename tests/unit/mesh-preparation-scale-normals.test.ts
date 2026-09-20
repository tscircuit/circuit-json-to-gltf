import { expect, test } from "bun:test"
import * as mat4 from "@jscad/modeling/src/maths/mat4"
import * as vec3 from "@jscad/modeling/src/maths/vec3"
import type { STLMesh } from "../../lib/types"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { fitMeshToCadBounds } from "../../lib/utils/cad-mesh-placement"
import { rotateMesh, scaleMesh } from "../../lib/utils/mesh-scale"

test("preparation preserves normal direction and winding through rotation and fitting", () => {
  const triangles: STLMesh["triangles"] = [
    {
      vertices: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: -1 },
        { x: 0, y: 1, z: -1 },
      ],
      normal: {
        x: 1 / Math.sqrt(3),
        y: 1 / Math.sqrt(3),
        z: 1 / Math.sqrt(3),
      },
    },
  ]
  const mesh = { triangles, boundingBox: boundsOfTriangles(triangles) }
  const rotated = rotateMesh(
    mesh,
    mat4.fromRotation(mat4.create(), 0.73, [1, 2, 3]),
  )
  const prepared = [
    rotated,
    fitMeshToCadBounds(rotated, { x: 2, y: 3, z: 5 }, "fill_bounds"),
    fitMeshToCadBounds(rotated, { x: -2, y: 3, z: 5 }, "fill_bounds"),
    scaleMesh(rotated, -2),
    scaleMesh(rotated, 2),
  ]

  for (const result of prepared) {
    const triangle = result.triangles[0]!
    const [a, b, c] = triangle.vertices.map((p) =>
      vec3.fromValues(p.x, p.y, p.z),
    )
    const ab = vec3.subtract(vec3.create(), b!, a!)
    const ac = vec3.subtract(vec3.create(), c!, a!)
    const { x, y, z } = triangle.normal
    const normal = vec3.fromValues(x, y, z)
    expect(vec3.dot(normal, ab)).toBeCloseTo(0, 10)
    expect(vec3.dot(normal, ac)).toBeCloseTo(0, 10)
    expect(vec3.length(normal)).toBeCloseTo(1, 10)
    expect(vec3.dot(vec3.cross(vec3.create(), ab, ac), normal)).toBeGreaterThan(
      0,
    )
    expect(result.boundingBox).toEqual(boundsOfTriangles(result.triangles))
  }

  for (const result of [
    fitMeshToCadBounds(rotated, { x: 2, y: 3, z: 0 }, "fill_bounds"),
    scaleMesh(rotated, 0),
  ]) {
    expect(result.triangles[0]!.normal).toEqual({ x: 0, y: 0, z: 0 })
    expect(result.boundingBox.min.z).toBe(0)
    expect(result.boundingBox.max.z).toBe(0)
    expect(result.boundingBox).toEqual(boundsOfTriangles(result.triangles))
  }
})
