import type { CadComponent } from "circuit-json"
import * as mat4 from "@jscad/modeling/src/maths/mat4"
import * as vec3 from "@jscad/modeling/src/maths/vec3"
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
  loaderTransform?: CoordinateTransformConfig,
): mat4.Mat4 {
  if (!modelBoardNormalDirection) return mat4.create()
  const nativeDirections: Record<
    NonNullable<CadComponent["model_board_normal_direction"]>,
    Point3
  > = {
    "x+": { x: 1, y: 0, z: 0 },
    "x-": { x: -1, y: 0, z: 0 },
    "y+": { x: 0, y: 1, z: 0 },
    "y-": { x: 0, y: -1, z: 0 },
    "z+": { x: 0, y: 0, z: 1 },
    "z-": { x: 0, y: 0, z: -1 },
  }
  // Like getMeshOrigin, carry the native model axis through the loader:
  // B * L * nativeNormal = scene +Y. Directions have no translation or units.
  const nativeNormal = nativeDirections[modelBoardNormalDirection]
  if (!nativeNormal) {
    throw new Error(
      `Unsupported model board-normal direction: ${modelBoardNormalDirection}`,
    )
  }
  const mapped = applyCoordinateTransform(nativeNormal, loaderTransform ?? {})
  const normal = vec3.fromValues(mapped.x, mapped.y, mapped.z)
  const length = vec3.length(normal)
  if (!Number.isFinite(length) || length === 0) {
    throw new Error(
      "Loader transform must preserve a finite nonzero board normal",
    )
  }
  vec3.normalize(normal, normal)
  const axis = vec3.cross(vec3.create(), normal, [0, 1, 0])
  const sine = vec3.length(axis)
  // Keep the established X-axis half-turn when the vectors are opposite.
  if (sine < 1e-12) {
    return normal[1] < 0
      ? mat4.fromXRotation(mat4.create(), Math.PI)
      : mat4.create()
  }
  return mat4.fromRotation(
    mat4.create(),
    Math.atan2(sine, normal[1]),
    vec3.normalize(axis, axis),
  )
}

/** Orient a loader-mapped mesh in the existing Y-up local scene frame. */
export function getMeshWithBoardNormalTransform<T extends STLMesh | OBJMesh>(
  mesh: T,
  modelBoardNormalDirection?: CadComponent["model_board_normal_direction"],
  loaderTransform?: CoordinateTransformConfig,
): T {
  return rotateMesh(
    mesh,
    getOrientationRotationForBoardNormal(
      modelBoardNormalDirection,
      loaderTransform,
    ),
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
): Point3 {
  const meshBounds = mesh.boundingBox
  const alignment = cad.model_origin_alignment ?? cad.anchor_alignment

  if (alignment === "center_of_component_on_board_surface") {
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
        getOrientationRotationForBoardNormal(
          options.modelBoardNormalDirection,
          options.loaderTransform,
        ),
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
