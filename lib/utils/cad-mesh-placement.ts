import type { CadComponent } from "circuit-json"
import type {
  CoordinateTransformConfig,
  OBJMesh,
  Point3,
  STLMesh,
} from "../types"
import { applyCoordinateTransform } from "./coordinate-transform"
import {
  getBoundingBoxCenter,
  getBoundingBoxSize,
  rotatePoint,
  rotateMesh,
  scaleMesh,
  scaleMeshByAxis,
} from "./mesh-scale"

function getOrientationRotationForBoardNormal(
  modelBoardNormalDirection?: CadComponent["model_board_normal_direction"],
): Point3 {
  if (!modelBoardNormalDirection || modelBoardNormalDirection === "z+") {
    return { x: 0, y: 0, z: 0 }
  }

  switch (modelBoardNormalDirection) {
    case "x+":
      return { x: 0, y: 0, z: 90 }
    case "x-":
      return { x: 0, y: 0, z: -90 }
    case "y+":
      return { x: 0, y: 0, z: 0 }
    case "y-":
      return { x: 0, y: 0, z: 180 }
    case "z-":
      return { x: 180, y: 0, z: 0 }
    default:
      return { x: 0, y: 0, z: 0 }
  }
}

export function getMeshWithBoardNormalTransform<T extends STLMesh | OBJMesh>(
  mesh: T,
  modelBoardNormalDirection?: CadComponent["model_board_normal_direction"],
): T {
  return rotateMesh(
    mesh,
    getOrientationRotationForBoardNormal(modelBoardNormalDirection),
  )
}

export function getMeshOrigin(
  cad: CadComponent,
  meshBounds: { min: Point3; max: Point3 },
  options?: {
    loaderTransform?: CoordinateTransformConfig
    modelBoardNormalDirection?: CadComponent["model_board_normal_direction"]
  },
): Point3 | null {
  if (cad.model_origin_position) {
    let origin: Point3 = {
      x: cad.model_origin_position.x,
      y: cad.model_origin_position.y,
      z: cad.model_origin_position.z,
    }

    if (options?.loaderTransform) {
      origin = applyCoordinateTransform(origin, options.loaderTransform)
    }

    if (options?.modelBoardNormalDirection) {
      origin = rotatePoint(
        origin,
        getOrientationRotationForBoardNormal(options.modelBoardNormalDirection),
      )
    }

    return origin
  }

  return { x: 0, y: 0, z: 0 }
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
