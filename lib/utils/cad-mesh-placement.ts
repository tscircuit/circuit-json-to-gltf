import type { CadComponent } from "circuit-json"
import { maths } from "@jscad/modeling"
import type {
  CoordinateTransformConfig,
  OBJMesh,
  Point3,
  STLMesh,
  Triangle,
} from "../types"
import { applyCoordinateTransform } from "./coordinate-transform"
import { boundsOfTriangles } from "./bounding-box"
import {
  getBoundingBoxCenter,
  getBoundingBoxSize,
  rotatePoint,
  rotateMesh,
  scaleMesh,
  scaleMeshByAxis,
} from "./mesh-scale"

/**
 * Bake a Circuit JSON intrinsic XYZ rotation (degrees, Z-up) into a default
 * footprinter mesh after origin/fit. Input/output points are Scene3D Y-up mm;
 * normals are directions. No translation or scale is applied here.
 */
export function rotateDefaultFootprinterMesh<T extends STLMesh | OBJMesh>(
  mesh: T,
  rotation: Point3,
): T {
  const { mat4, vec3 } = maths
  // The legacy FOOTPRINTER_MODEL_TRANSFORM has effective basis S(x,y,z)=(x,z,y).
  // Match 3d-viewer/src/three-components/FootprinterModel.tsx's Three.Group
  // default XYZ Euler: R_cad = Rx * Ry * Rz, not the shared legacy scene Euler.
  const swapYZ = mat4.fromValues(1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1)
  const radians = Math.PI / 180
  const matrix = mat4.clone(swapYZ)
  mat4.rotateX(matrix, matrix, rotation.x * radians)
  mat4.rotateY(matrix, matrix, rotation.y * radians)
  mat4.rotateZ(matrix, matrix, rotation.z * radians)
  mat4.multiply(matrix, matrix, swapYZ) // S * R_cad * inverse(S); S^-1 = S.

  const rotate = (point: Point3): Point3 => {
    const [x, y, z] = vec3.transform(
      vec3.create(),
      [point.x, point.y, point.z],
      matrix,
    )
    return { x, y, z }
  }
  const triangles: Triangle[] = mesh.triangles.map((triangle) => ({
    ...triangle,
    vertices: [
      rotate(triangle.vertices[0]),
      rotate(triangle.vertices[1]),
      rotate(triangle.vertices[2]),
    ],
    normal: rotate(triangle.normal),
  }))
  return { ...mesh, triangles, boundingBox: boundsOfTriangles(triangles) }
}

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
