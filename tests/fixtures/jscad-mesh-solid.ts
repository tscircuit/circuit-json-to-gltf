import type { ManifoldToplevel } from "manifold-3d"
import type { CadComponentMesh } from "../../lib/loaders/cad-component-mesh"

type VertexPositionKey = string

export function createJscadMeshSolid(
  manifold: ManifoldToplevel,
  mesh: CadComponentMesh,
) {
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
