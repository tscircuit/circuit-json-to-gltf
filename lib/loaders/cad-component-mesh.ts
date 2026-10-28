import type { CadComponent, PcbComponent } from "circuit-json"
import { createMeshFromSTL, transformMesh } from "../gltf/geometry"
import type { CircuitTo3DOptions } from "../types"
import { loadCadComponentBox } from "./cad-component-box"

/** Indexed triangles in right-handed Circuit JSON world coordinates, +Z up,
 * millimetres. Positions are points with the CAD placement baked in; indices
 * wind counter-clockwise when viewed from outside. Coincident vertices share
 * an index without rounding or moving their coordinates. */
export interface CadComponentMesh {
  positions: number[]
  indices: number[]
}

export type CadComponentMeshOptions = Pick<
  CircuitTo3DOptions,
  "coordinateTransform" | "projectBaseUrl" | "authHeaders"
> & { pcbComponent?: PcbComponent }

type VertexPositionKey = string

/** Load the actual CAD model at its supplied position and rotation, using the
 * renderer's model/origin/scale/layer rules. Folded CAD must already carry its
 * resolved assembled pose. No board, textures or renderer objects are created.
 * Missing, failed or empty models throw instead of returning a bounding box.
 * Solid validity remains the caller's check; open models are not repaired. */
export async function loadCadComponentMesh(
  cadComponent: CadComponent,
  options: CadComponentMeshOptions = {},
): Promise<CadComponentMesh> {
  const box = await loadCadComponentBox(cadComponent, options)
  if (!box?.mesh?.triangles.length) {
    throw new Error(
      `No triangle mesh available for ${cadComponent.cad_component_id}`,
    )
  }
  // GLTFBuilder.addBox applies this rotation and puts box.center on the
  // node. Bake that same placement before its final scene-to-glTF X reflection.
  const mesh = transformMesh(
    createMeshFromSTL(box.mesh),
    box.center,
    box.rotation,
  )
  const positions: number[] = []
  const indices: number[] = []
  const vertices = new Map<VertexPositionKey, number>()
  for (let triangle = 0; triangle < mesh.indices.length; triangle += 3) {
    // Inverse of CIRCUIT_Z_UP_TO_SCENE_Y_UP: swap Y/Z and reverse winding
    // together, matching pcb-fold.swapMeshFrame's reflection boundary.
    for (const corner of [0, 2, 1]) {
      const offset = mesh.indices[triangle + corner]! * 3
      const point = [
        mesh.positions[offset]!,
        mesh.positions[offset + 2]!,
        mesh.positions[offset + 1]!,
      ]
      const key = point.join(",")
      let index = vertices.get(key)
      if (index === undefined) {
        index = positions.length / 3
        vertices.set(key, index)
        positions.push(...point)
      }
      indices.push(index)
    }
  }
  return { positions, indices }
}
