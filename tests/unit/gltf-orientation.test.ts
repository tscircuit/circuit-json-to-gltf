import { expect, test } from "bun:test"
import {
  convertMeshToGLTFOrientation,
  transformMesh,
  type MeshData,
} from "../../lib/gltf/geometry"

const baseMesh: MeshData = {
  positions: [0, 0, 0, 1, 0, 0, 0, 1, 0],
  normals: [1, 0, 0, 1, 0, 0, 1, 0, 0],
  texcoords: [0, 0, 1, 0, 0, 1],
  indices: [0, 1, 2],
}

test("transformMesh applies translation without flipping axes", () => {
  const translated = transformMesh(baseMesh, { x: 1, y: 2, z: 3 })

  expect(translated.positions).toEqual([1, 2, 3, 2, 2, 3, 1, 3, 3])
  expect(translated.normals).toEqual(baseMesh.normals)
  expect(translated.indices).toEqual(baseMesh.indices)
})

test("convertMeshToGLTFOrientation flips X axis and winding", () => {
  const translated = transformMesh(baseMesh, { x: 1, y: 2, z: 3 })
  const oriented = convertMeshToGLTFOrientation(translated)

  expect(oriented.positions).toEqual([-1, 2, 3, -2, 2, 3, -1, 3, 3])
  expect(oriented.normals).toEqual([-1, 0, 0, -1, 0, 0, -1, 0, 0])
  expect(oriented.indices).toEqual([0, 2, 1])
  expect(oriented.texcoords).toEqual(baseMesh.texcoords)
})
