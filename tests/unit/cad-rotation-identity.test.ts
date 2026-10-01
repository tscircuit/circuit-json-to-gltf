import { expect, test } from "bun:test"
import { transformMesh } from "../../lib/gltf/geometry"
import { cadRotationProbe } from "../fixtures/cad-rotation-probe"

test("no CAD rotation preserves scaling, translation and source arrays", () => {
  const original = structuredClone(cadRotationProbe)
  const mesh = transformMesh(
    cadRotationProbe,
    { x: 7, y: 5, z: -11 },
    undefined,
    { x: 2, y: 3, z: 4 },
  )
  expect(mesh.positions).toEqual([9, 14, -3])
  expect(mesh.normals).toEqual(original.normals)
  expect(mesh.texcoords).toEqual(original.texcoords)
  expect(cadRotationProbe).toEqual(original)
})
