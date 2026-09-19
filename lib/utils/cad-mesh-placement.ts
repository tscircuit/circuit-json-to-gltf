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
      return { x: 0, y: -90, z: 0 }
    case "x-":
      return { x: 0, y: 90, z: 0 }
    case "y+":
      return { x: 90, y: 0, z: 0 }
    case "y-":
      return { x: -90, y: 0, z: 0 }
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

function getBoardContactBounds(mesh: STLMesh | OBJMesh) {
  const minZ = mesh.boundingBox.min.z
  const height = mesh.boundingBox.max.z - minZ
  const tolerance = Math.max(1e-6, height * 1e-5)

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity
  let hasContactVertex = false

  for (const triangle of mesh.triangles) {
    for (const vertex of triangle.vertices) {
      if (Math.abs(vertex.z - minZ) > tolerance) continue

      hasContactVertex = true
      minX = Math.min(minX, vertex.x)
      maxX = Math.max(maxX, vertex.x)
      minY = Math.min(minY, vertex.y)
      maxY = Math.max(maxY, vertex.y)
    }
  }

  if (!hasContactVertex) return null

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: minZ },
  }
}

function getInferredMeshOrigin(
  cad: CadComponent,
  mesh: STLMesh | OBJMesh,
): Point3 {
  const meshBounds = mesh.boundingBox
  const alignment = cad.model_origin_alignment ?? cad.anchor_alignment

  if (alignment === "center_of_component_on_board_surface") {
    const contactBounds = getBoardContactBounds(mesh)
    const center = getBoundingBoxCenter(contactBounds ?? meshBounds)

    return {
      x: center.x,
      y: center.y,
      z: 0,
    }
  }

  if (alignment === "center") {
    return getBoundingBoxCenter(meshBounds)
  }

  return { x: 0, y: 0, z: 0 }
}

/** Preserve exporter datum policy, measured in canonical Z-up local space. */
export function getMeshOrigin(
  cad: CadComponent,
  mesh: STLMesh | OBJMesh,
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

  return getInferredMeshOrigin(cad, mesh)
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
