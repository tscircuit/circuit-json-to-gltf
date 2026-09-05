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

type BoardSurfaceOriginStrategy =
  | "infer_from_contact_bounds"
  | "preserve_model_origin"

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

function getBoardContactBounds(mesh: STLMesh | OBJMesh) {
  const minY = mesh.boundingBox.min.y
  const height = mesh.boundingBox.max.y - minY
  const tolerance = Math.max(1e-6, height * 1e-5)

  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity
  let hasContactVertex = false

  for (const triangle of mesh.triangles) {
    for (const vertex of triangle.vertices) {
      if (Math.abs(vertex.y - minY) > tolerance) continue

      hasContactVertex = true
      minX = Math.min(minX, vertex.x)
      maxX = Math.max(maxX, vertex.x)
      minZ = Math.min(minZ, vertex.z)
      maxZ = Math.max(maxZ, vertex.z)
    }
  }

  if (!hasContactVertex) return null

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: minY, z: maxZ },
  }
}

function getInferredMeshOrigin(
  cad: CadComponent,
  mesh: STLMesh | OBJMesh,
  boardSurfaceOriginStrategy: BoardSurfaceOriginStrategy,
): Point3 {
  const meshBounds = mesh.boundingBox
  const alignment = cad.model_origin_alignment ?? cad.anchor_alignment

  if (alignment === "center_of_component_on_board_surface") {
    if (boardSurfaceOriginStrategy === "preserve_model_origin") {
      return { x: 0, y: 0, z: 0 }
    }

    const contactBounds = getBoardContactBounds(mesh)
    const center = getBoundingBoxCenter(contactBounds ?? meshBounds)

    return {
      x: center.x,
      y: 0,
      z: center.z,
    }
  }

  if (alignment === "center") {
    return getBoundingBoxCenter(meshBounds)
  }

  return { x: 0, y: 0, z: 0 }
}

/**
 * Returns an origin point in the mesh's intermediate Scene3D frame (mm):
 * +X follows Circuit X, +Y is up, and +Z follows Circuit Y, before placement.
 * Explicit model origins pass through the same loader and board-normal
 * transforms as the mesh. Subtract this point before fitting and placement.
 */
export function getMeshOrigin(
  cad: CadComponent,
  mesh: STLMesh | OBJMesh,
  options?: {
    loaderTransform?: CoordinateTransformConfig
    modelBoardNormalDirection?: CadComponent["model_board_normal_direction"]
    boardSurfaceOriginStrategy?: BoardSurfaceOriginStrategy
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

  return getInferredMeshOrigin(
    cad,
    mesh,
    options?.boardSurfaceOriginStrategy ?? "infer_from_contact_bounds",
  )
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
