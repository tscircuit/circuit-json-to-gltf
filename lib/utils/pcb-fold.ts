import {
  createPcbFold,
  foldSurfaceMesh,
  type PcbFold,
} from "@tscircuit/flex-utils"
import type { PcbStiffener } from "circuit-json"
import type { Point3, STLMesh } from "../types"
export {
  createPcbFold,
  type PcbFold,
  type PcbBendRecord,
} from "@tscircuit/flex-utils"
export type PcbStiffenerRecord = PcbStiffener

/** Scene3D (+Y up, mm) <-> Circuit JSON (+Z up, mm). This axis swap matches
 * CIRCUIT_Z_UP_TO_SCENE_Y_UP. It is a reflection, so mesh winding swaps too. */
export const swapPcbSceneAxes = (p: Point3): Point3 => ({
  x: p.x,
  y: p.z,
  z: p.y,
})
export function swapMeshFrame(mesh: STLMesh): STLMesh {
  return {
    ...mesh,
    boundingBox: {
      min: swapPcbSceneAxes(mesh.boundingBox.min),
      max: swapPcbSceneAxes(mesh.boundingBox.max),
    },
    triangles: mesh.triangles.map((t) => ({
      ...t,
      vertices: [t.vertices[0], t.vertices[2], t.vertices[1]].map(
        swapPcbSceneAxes,
      ) as typeof t.vertices,
      normal: swapPcbSceneAxes(t.normal),
      ...(t.uvs ? { uvs: [t.uvs[0], t.uvs[2], t.uvs[1]] as typeof t.uvs } : {}),
    })),
  }
}
/** All surface tessellation and deformation lives in flex-utils. */
export function foldBoardMesh(mesh: STLMesh, fold: PcbFold): STLMesh {
  return swapMeshFrame(foldSurfaceMesh(swapMeshFrame(mesh), fold))
}
