import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("standalone mesh GLB preserves asset axes with explicit identity and accepts mapping", () => {
  const { glb } = createGLTFAsset()
  const mesh = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
  expect(mesh.triangles[0]!.vertices).toEqual([
    { x: 1, y: 2, z: 3 },
    { x: 2, y: 2, z: 3 },
    { x: 1, y: 3, z: 4 },
  ])
  expect(mesh.boundingBox).toEqual({
    min: { x: 1, y: 2, z: 3 },
    max: { x: 2, y: 3, z: 4 },
  })
  expect(
    parseGLB(glb, { axisMapping: { x: "x", y: "-z", z: "y" } }).triangles[0]!
      .vertices,
  ).toEqual([
    { x: 1, y: -3, z: 2 },
    { x: 2, y: -3, z: 2 },
    { x: 1, y: -4, z: 3 },
  ])
})
