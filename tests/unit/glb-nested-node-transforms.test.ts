import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("GLB applies nested mixed TRS from mesh to ancestors, including normal scale", () => {
  for (const indexed of [true, false]) {
    for (const normals of [undefined, [0, -1, 1, 0, -1, 1, 0, -1, 1]]) {
      const { glb } = createGLTFAsset({
        indexed,
        normals,
        graph: {
          scenes: [{ nodes: [0] }],
          nodes: [
            {
              translation: [10, -5, 7],
              rotation: [0, 1 / Math.sqrt(5), 0, 2 / Math.sqrt(5)],
              scale: [2, 3, 4],
              children: [1],
            },
            {
              translation: [1, 2, 3],
              rotation: [0, 0, Math.SQRT1_2, Math.SQRT1_2],
              scale: [2, 1, 3],
              children: [2],
            },
            {
              mesh: 0,
              translation: [-2, 1, 4],
              rotation: [0.5, 0.5, 0.5, 0.5],
              scale: [1, 2, 1],
            },
          ],
        },
      })
      const { triangles } = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
      expect(triangles).toHaveLength(1)
      const triangle = triangles[0]!
      // Child cycles (x,y,z)->(z,x,y), middle rotates Z by 90 degrees,
      // parent rotates Y with cos=.6, sin=.8, each after its own scale.
      const expected = [
        [95.2, 7, 73.4],
        [94, 7, 75],
        [114.4, 13, 87.8],
      ]
      for (const [i, point] of triangle.vertices.entries()) {
        expect(point.x).toBeCloseTo(expected[i]![0]!, 9)
        expect(point.y).toBeCloseTo(expected[i]![1]!, 9)
        expect(point.z).toBeCloseTo(expected[i]![2]!, 9)
      }
      // Cross of the independently calculated world edges: (-9.6,48,-7.2).
      expect(triangle.normal.x).toBeCloseTo(-0.8 / Math.sqrt(17), 9)
      expect(triangle.normal.y).toBeCloseTo(4 / Math.sqrt(17), 9)
      expect(triangle.normal.z).toBeCloseTo(-0.6 / Math.sqrt(17), 9)
    }
  }
})
