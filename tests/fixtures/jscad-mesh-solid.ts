import type { ManifoldToplevel } from "manifold-3d"
import { createMeshFromSTL } from "../../lib/gltf/geometry"
import type { STLMesh } from "../../lib/types"

type VertexPositionKey = string

/** Validate the same Y-up mm triangles consumed by the glTF builder. */
export function createJscadMeshSolid(
  manifold: ManifoldToplevel,
  stlMesh: STLMesh,
) {
  const mesh = createMeshFromSTL(stlMesh)
  const vertices = new Map<VertexPositionKey, number>()
  const positions: number[] = []
  const remap: number[] = []
  for (let offset = 0; offset < mesh.positions.length; offset += 3) {
    const point = mesh.positions.slice(offset, offset + 3)
    const key = point.join(",")
    let index = vertices.get(key)
    if (index === undefined) {
      index = positions.length / 3
      vertices.set(key, index)
      positions.push(...point)
    }
    remap.push(index)
  }
  return new manifold.Manifold(
    new manifold.Mesh({
      numProp: 3,
      vertProperties: new Float32Array(positions),
      triVerts: new Uint32Array(mesh.indices.map((index) => remap[index]!)),
    }),
  )
}
