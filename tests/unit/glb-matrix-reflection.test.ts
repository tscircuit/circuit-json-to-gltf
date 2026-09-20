import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("GLB honors column-major matrices and repairs reflected winding and normals", () => {
  for (const indexed of [true, false]) {
    for (const normals of [undefined, [0, -1, 1, 0, -1, 1, 0, -1, 1]]) {
      const { glb } = createGLTFAsset({
        indexed,
        normals,
        graph: {
          scenes: [{ nodes: [0] }],
          nodes: [
            {
              translation: [10, 20, 30],
              rotation: [0.5, 0.5, 0.5, 0.5],
              children: [1],
            },
            {
              mesh: 0,
              // (x,y,z) -> (5-3y, 7-2x, 11+4z), determinant -24.
              matrix: [0, -2, 0, 0, -3, 0, 0, 0, 0, 0, 4, 0, 5, 7, 11, 1],
              translation: [999, 999, 999],
              scale: [999, 999, 999],
            },
          ],
        },
      })
      const triangle = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
        .triangles[0]!
      const expected = [
        [33, 19, 35],
        [37, 16, 35],
        [33, 19, 33],
      ]
      for (const [i, point] of triangle.vertices.entries()) {
        expect(point.x).toBeCloseTo(expected[i]![0]!, 9)
        expect(point.y).toBeCloseTo(expected[i]![1]!, 9)
        expect(point.z).toBeCloseTo(expected[i]![2]!, 9)
      }
      expect(triangle.normal.x).toBeCloseTo(0.6, 9)
      expect(triangle.normal.y).toBeCloseTo(0.8, 9)
      expect(triangle.normal.z).toBeCloseTo(0, 9)
    }
  }
})
