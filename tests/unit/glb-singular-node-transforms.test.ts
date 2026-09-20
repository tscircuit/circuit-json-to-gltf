import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import type { Triangle } from "../../lib/types"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("GLB singular TRS and matrices collapse positions with zero normals and unchanged winding", () => {
  const cases: {
    scale: [number, number, number]
    expected: Triangle["vertices"]
  }[] = [
    {
      scale: [1, 1, 0],
      expected: [
        { x: 9, y: 19, z: 23 },
        { x: 11, y: 19, z: 23 },
        { x: 9, y: 22, z: 23 },
      ],
    },
    {
      scale: [-1, 1, 0],
      expected: [
        { x: 5, y: 19, z: 23 },
        { x: 3, y: 19, z: 23 },
        { x: 5, y: 22, z: 23 },
      ],
    },
    {
      scale: [0, 0, 0],
      expected: [
        { x: 7, y: 13, z: 23 },
        { x: 7, y: 13, z: 23 },
        { x: 7, y: 13, z: 23 },
      ],
    },
  ]
  for (const { scale, expected } of cases) {
    for (const indexed of [true, false]) {
      for (const normals of [undefined, [0, -1, 1, 0, -1, 1, 0, -1, 1]]) {
        for (const node of [
          { scale, translation: [1, 2, 3] },
          {
            matrix: [
              scale[0],
              0,
              0,
              0,
              0,
              scale[1],
              0,
              0,
              0,
              0,
              scale[2],
              0,
              1,
              2,
              3,
              1,
            ],
          },
        ]) {
          const { glb } = createGLTFAsset({
            indexed,
            normals,
            graph: {
              scenes: [{ nodes: [0] }],
              nodes: [
                {
                  scale: [2, 3, 4],
                  translation: [5, 7, 11],
                  children: [1],
                },
                { mesh: 0, ...node },
              ],
            },
          })
          const mesh = parseGLB(glb)
          expect(mesh.triangles).toHaveLength(1)
          expect(mesh.triangles[0]!.vertices).toEqual(expected)
          expect(mesh.triangles[0]!.normal).toEqual({ x: 0, y: 0, z: 0 })
          expect(mesh.boundingBox.min.z).toBe(23)
          expect(mesh.boundingBox.max.z).toBe(23)
        }
      }
    }
  }
})
