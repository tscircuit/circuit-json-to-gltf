import type { CadComponent, PcbComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../converters/circuit-to-3d"
import { createMeshFromSTL, transformMesh } from "../gltf/geometry"
import type { CircuitTo3DOptions } from "../types"

/** Indexed triangles in Circuit JSON world coordinates: right-handed, +X right,
 * +Y top, +Z above, millimetres. Positions are points (translation baked in).
 * Indices wind counter-clockwise as viewed from outside a closed solid.
 * No renderer objects, textures, or material data are required by consumers.
 */
export interface CadComponentMesh {
  positions: number[]
  indices: number[]
}

/** Load and place one CAD component through the same format/origin/scale/layer
 * rules as convertCircuitJsonTo3D. Output is world Z-up, not Scene3D Y-up or
 * final glTF coordinates. Does not generate PCB geometry or textures and never
 * returns a fallback bounding box when the real model could not be loaded.
 * For folded assemblies supply the already-resolved assembled CAD pose.
 */
export async function loadCadComponentMesh(
  cadComponent: CadComponent,
  options: Pick<CircuitTo3DOptions, "projectBaseUrl" | "authHeaders"> & {
    pcbComponent?: PcbComponent
  } = {},
): Promise<CadComponentMesh> {
  const { pcbComponent, ...loaderOptions } = options
  // The pose is authoritative here. Without bend records, this flag would ask
  // the scene converter to unfold a pose without its original board context.
  const scene = await convertCircuitJsonTo3D(
    [
      ...(pcbComponent ? [pcbComponent] : []),
      { ...cadComponent, is_on_folded_board: false },
    ],
    {
      ...loaderOptions,
      drawFauxBoard: false,
      renderBoardTextures: false,
      conformingModelMeshes: true,
    },
  )
  const box = scene.boxes.find((box) => box.mesh)
  if (!box?.mesh) {
    throw new Error(
      `No triangle mesh available for ${cadComponent.cad_component_id}`,
    )
  }
  // Reuse GLTFBuilder's exact Scene3D placement expression. This is before its
  // final scene-to-glTF mirror; DRC stays in the original circuit world frame.
  const mesh = transformMesh(
    createMeshFromSTL(box.mesh),
    box.center,
    box.rotation,
  )
  // Inverse of CIRCUIT_Z_UP_TO_SCENE_Y_UP / swapMeshFrame: swap Y/Z and
  // triangle winding together because the axis swap is a reflection.
  for (let i = 0; i < mesh.positions.length; i += 3) {
    const sceneY = mesh.positions[i + 1]!
    mesh.positions[i + 1] = mesh.positions[i + 2]!
    mesh.positions[i + 2] = sceneY
  }
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const second = mesh.indices[i + 1]!
    mesh.indices[i + 1] = mesh.indices[i + 2]!
    mesh.indices[i + 2] = second
  }
  return { positions: mesh.positions, indices: mesh.indices }
}
