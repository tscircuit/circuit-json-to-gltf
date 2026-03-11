import type { CadComponent } from "circuit-json"
import type { OBJMesh, Point3, STLMesh } from "../types"
import {
  getBoundingBoxCenter,
  getBoundingBoxSize,
  scaleMesh,
  scaleMeshByAxis,
} from "./mesh-scale"

export function getModelOrientationRotation(cad: CadComponent): Point3 {
  const modelBoardNormalDirection = cad.model_board_normal_direction
  if (!modelBoardNormalDirection) {
    return { x: 0, y: 0, z: 0 }
  }

  switch (modelBoardNormalDirection) {
    case "x-":
      return { x: 0, y: 0, z: -90 }
    case "y-":
      return { x: 0, y: 0, z: 180 }
    case "z-":
      return { x: 180, y: 0, z: 0 }
    default:
      return { x: 0, y: 0, z: 0 }
  }
}

export function getMeshOrigin(
  cad: CadComponent,
  meshBounds: { min: Point3; max: Point3 },
): Point3 | null {
  if (cad.model_origin_position) {
    return cad.model_origin_position
  }

  switch (cad.model_origin_alignment) {
    case "center":
      return getBoundingBoxCenter(meshBounds)
    case "center_of_component_on_board_surface":
      return {
        x: (meshBounds.min.x + meshBounds.max.x) / 2,
        y: meshBounds.min.y,
        z: (meshBounds.min.z + meshBounds.max.z) / 2,
      }
    default:
      return null
  }
}

export function fitMeshToCadBounds<T extends STLMesh | OBJMesh>(
  mesh: T,
  targetSize: Point3,
  fitMode: NonNullable<CadComponent["model_object_fit"]>,
): T {
  const meshSize = getBoundingBoxSize(mesh.boundingBox)
  const safeScale = {
    x: meshSize.x > 0 ? targetSize.x / meshSize.x : 1,
    y: meshSize.y > 0 ? targetSize.y / meshSize.y : 1,
    z: meshSize.z > 0 ? targetSize.z / meshSize.z : 1,
  }

  if (fitMode === "fill_bounds") {
    return scaleMeshByAxis(mesh, safeScale)
  }

  const uniformScale = Math.min(safeScale.x, safeScale.y, safeScale.z)
  return scaleMesh(mesh, uniformScale)
}
