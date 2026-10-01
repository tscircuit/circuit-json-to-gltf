import {
  convertMeshToGLTFOrientation,
  type MeshData,
  transformMesh,
} from "../../lib/gltf/geometry"
import type { Point3 } from "../../lib/types"

export const cadRotationProbe: MeshData = {
  positions: [1, 3, 2],
  normals: [0, 1, 0],
  texcoords: [0.25, 0.75],
  indices: [],
}

export function placeCadRotationProbe(rotation: Point3) {
  return convertMeshToGLTFOrientation(
    transformMesh(cadRotationProbe, { x: 7, y: 5, z: -11 }, rotation),
  )
}
