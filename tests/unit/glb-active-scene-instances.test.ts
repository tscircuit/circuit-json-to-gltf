import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createGLTFAsset, encodeGLTFAsset } from "../fixtures/gltf-asset"

test("GLB emits every active scene instance but no orphan meshes or inactive nodes", () => {
  const { gltf, binary } = createGLTFAsset({
    graph: {
      scene: 1,
      scenes: [{ nodes: [0] }, { nodes: [1, 2] }, { nodes: [] }],
      nodes: [
        { mesh: 0, translation: [1000, 1000, 1000] },
        { children: [3], translation: [10, 20, 30] },
        { mesh: 0, translation: [-10, -20, -30] },
        { mesh: 0, translation: [1, 2, 3] },
        { mesh: 1, translation: [2000, 2000, 2000] },
      ],
    },
  })
  gltf.meshes.push(gltf.meshes[0]!)
  const { triangles } = parseGLB(
    encodeGLTFAsset(gltf, binary),
    COORDINATE_TRANSFORMS.IDENTITY,
  )
  expect(triangles).toHaveLength(2)
  expect(triangles.map((t) => t.vertices[0])).toEqual([
    { x: 12, y: 24, z: 36 },
    { x: -9, y: -18, z: -27 },
  ])
  const defaultScene = parseGLB(
    encodeGLTFAsset({ ...gltf, scene: undefined }, binary),
    COORDINATE_TRANSFORMS.IDENTITY,
  )
  expect(defaultScene.triangles).toHaveLength(1)
  expect(defaultScene.triangles[0]!.vertices[0]).toEqual({
    x: 1001,
    y: 1002,
    z: 1003,
  })
  expect(
    parseGLB(
      encodeGLTFAsset({ ...gltf, scene: 2 }, binary),
      COORDINATE_TRANSFORMS.IDENTITY,
    ).triangles,
  ).toEqual([])
})
