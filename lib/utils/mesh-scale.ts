import type { BoundingBox, OBJMesh, Point3, STLMesh, Triangle } from "../types"
import { boundsOfTriangles } from "./bounding-box"
import * as vec3 from "@jscad/modeling/src/maths/vec3"
import * as mat4 from "@jscad/modeling/src/maths/mat4"
import { getCadRotationMatrix } from "./cad-rotation"

function scalePointByAxis(point: Point3, scale: Point3): Point3 {
  return {
    x: point.x * scale.x,
    y: point.y * scale.y,
    z: point.z * scale.z,
  }
}

/**
 * Existing 3D helper: intrinsic XYZ degrees or a pure-rotation matrix.
 * Unlike circuit-json-util/shape-distances:rotatePoint (2D, one radian angle),
 * this rotates Point3; retain the existing name for callers of this module.
 */
export function rotatePoint(
  point: Point3,
  rotation: Point3 | mat4.Mat4,
): Point3 {
  const matrix = Array.isArray(rotation)
    ? rotation
    : getCadRotationMatrix({
        x: (rotation.x * Math.PI) / 180,
        y: (rotation.y * Math.PI) / 180,
        z: (rotation.z * Math.PI) / 180,
      })
  const [x, y, z] = vec3.transform(
    vec3.create(),
    [point.x, point.y, point.z],
    matrix,
  )
  return { x, y, z }
}

export function scaleMesh<T extends STLMesh | OBJMesh>(
  mesh: T,
  scale: number,
): T {
  if (!Number.isFinite(scale) || scale === 1) {
    return mesh
  }

  return scaleMeshByAxis(mesh, { x: scale, y: scale, z: scale })
}

export function scaleMeshByAxis<T extends STLMesh | OBJMesh>(
  mesh: T,
  scale: Point3,
): T {
  if (
    !Number.isFinite(scale.x) ||
    !Number.isFinite(scale.y) ||
    !Number.isFinite(scale.z) ||
    (scale.x === 1 && scale.y === 1 && scale.z === 1)
  ) {
    return mesh
  }

  const singularScale = scale.x === 0 || scale.y === 0 || scale.z === 0
  const scaledTriangles = mesh.triangles.map((triangle): Triangle => {
    // Three's inverse normal matrix is zero for a singular model transform.
    const normal = singularScale
      ? vec3.create()
      : vec3.normalize(vec3.create(), [
          triangle.normal.x / scale.x,
          triangle.normal.y / scale.y,
          triangle.normal.z / scale.z,
        ])
    const vertices: [Point3, Point3, Point3] = [
      scalePointByAxis(triangle.vertices[0], scale),
      scalePointByAxis(triangle.vertices[1], scale),
      scalePointByAxis(triangle.vertices[2], scale),
    ]
    if (scale.x * scale.y * scale.z < 0) {
      ;[vertices[1], vertices[2]] = [vertices[2], vertices[1]]
    }
    return {
      ...triangle,
      vertices,
      normal: { x: normal[0], y: normal[1], z: normal[2] },
    }
  })

  return {
    ...mesh,
    triangles: scaledTriangles,
    boundingBox: boundsOfTriangles(scaledTriangles),
  } as T
}

export function translateMesh<T extends STLMesh | OBJMesh>(
  mesh: T,
  offset: Point3,
): T {
  if (offset.x === 0 && offset.y === 0 && offset.z === 0) {
    return mesh
  }

  const translatedTriangles = mesh.triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map((vertex) => ({
      x: vertex.x + offset.x,
      y: vertex.y + offset.y,
      z: vertex.z + offset.z,
    })) as [Point3, Point3, Point3],
  }))

  return {
    ...mesh,
    triangles: translatedTriangles,
    boundingBox: {
      min: {
        x: mesh.boundingBox.min.x + offset.x,
        y: mesh.boundingBox.min.y + offset.y,
        z: mesh.boundingBox.min.z + offset.z,
      },
      max: {
        x: mesh.boundingBox.max.x + offset.x,
        y: mesh.boundingBox.max.y + offset.y,
        z: mesh.boundingBox.max.z + offset.z,
      },
    },
  } as T
}

export function rotateMesh<T extends STLMesh | OBJMesh>(
  mesh: T,
  rotation: Point3 | mat4.Mat4,
): T {
  const matrix = Array.isArray(rotation)
    ? rotation
    : getCadRotationMatrix({
        x: (rotation.x * Math.PI) / 180,
        y: (rotation.y * Math.PI) / 180,
        z: (rotation.z * Math.PI) / 180,
      })
  if (mat4.isIdentity(matrix)) {
    return mesh
  }

  const rotatedTriangles = mesh.triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map((vertex) =>
      rotatePoint(vertex, matrix),
    ) as [Point3, Point3, Point3],
    normal: rotatePoint(triangle.normal, matrix),
  }))

  return {
    ...mesh,
    triangles: rotatedTriangles,
    boundingBox: boundsOfTriangles(rotatedTriangles),
  } as T
}

export function getBoundingBoxSize(bounds: BoundingBox): Point3 {
  return {
    x: bounds.max.x - bounds.min.x,
    y: bounds.max.y - bounds.min.y,
    z: bounds.max.z - bounds.min.z,
  }
}

export function getBoundingBoxCenter(bounds: BoundingBox): Point3 {
  return {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2,
  }
}
