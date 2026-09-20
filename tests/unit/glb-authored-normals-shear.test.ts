import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("GLB inverse transpose preserves authored normals under hierarchy-induced shear", () => {
  const { glb } = createGLTFAsset({
    normals: [1, 2, 3, 1, 2, 3, 1, 2, 3],
    graph: {
      scenes: [{ nodes: [0] }],
      nodes: [
        { translation: [5, 7, 11], scale: [2, 3, 4], children: [1] },
        {
          mesh: 0,
          translation: [1, 2, 3],
          rotation: [0, 0, 1 / Math.sqrt(5), 2 / Math.sqrt(5)],
          scale: [2, 1, 3],
        },
      ],
    },
  })
  const triangle = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY).triangles[0]!
  // x' = 2.4x - 1.6y + 7, y' = 4.8x + 1.8y + 13, z' = 12z + 23.
  const expected = [
    [6.2, 21.4, 59],
    [8.6, 26.2, 59],
    [4.6, 23.2, 71],
  ]
  for (const [i, point] of triangle.vertices.entries()) {
    expect(point.x).toBeCloseTo(expected[i]![0]!, 9)
    expect(point.y).toBeCloseTo(expected[i]![1]!, 9)
    expect(point.z).toBeCloseTo(expected[i]![2]!, 9)
  }
  // Authored (1,2,3), not the face normal: inverse scales and Z rotation give
  // (-.65, 8/15, .25), proportional to (-39,32,15).
  expect(triangle.normal.x).toBeCloseTo(-39 / Math.sqrt(2770), 9)
  expect(triangle.normal.y).toBeCloseTo(32 / Math.sqrt(2770), 9)
  expect(triangle.normal.z).toBeCloseTo(15 / Math.sqrt(2770), 9)
})
