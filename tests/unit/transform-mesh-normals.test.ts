import { expect, test } from "bun:test"
import * as vec3 from "@jscad/modeling/src/maths/vec3"
import { transformMesh, type MeshData } from "../../lib/gltf/geometry"

test("nonuniform scale preserves perpendicular normals and outward winding", () => {
  const mesh: MeshData = {
    positions: [0, 0, 0, 1, 0, -1, 0, 1, -1],
    normals: Array.from({ length: 9 }, () => 1 / Math.sqrt(3)),
    indices: [0, 1, 2],
    texcoords: [0, 0, 1, 0, 0, 1],
  }
  for (const xScale of [2, -2]) {
    const placed = transformMesh(
      mesh,
      { x: 7, y: -11, z: 3 },
      { x: 0.37, y: -0.51, z: 0.73 },
      { x: xScale, y: 3, z: 5 },
    )
    const [a, b, c] = placed.indices.map((index) =>
      vec3.fromValues(
        placed.positions[index * 3]!,
        placed.positions[index * 3 + 1]!,
        placed.positions[index * 3 + 2]!,
      ),
    )
    const ab = vec3.subtract(vec3.create(), b!, a!)
    const ac = vec3.subtract(vec3.create(), c!, a!)
    const normal = vec3.fromValues(
      placed.normals[0]!,
      placed.normals[1]!,
      placed.normals[2]!,
    )
    expect(vec3.dot(normal, ab)).toBeCloseTo(0, 10)
    expect(vec3.dot(normal, ac)).toBeCloseTo(0, 10)
    expect(vec3.length(normal)).toBeCloseTo(1, 10)
    expect(vec3.dot(vec3.cross(vec3.create(), ab, ac), normal)).toBeGreaterThan(
      0,
    )
  }
})
