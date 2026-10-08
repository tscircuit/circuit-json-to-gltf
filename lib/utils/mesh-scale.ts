import type { BoundingBox, OBJMesh, Point3, STLMesh } from "../types"
import { boundsOfTriangles } from "./bounding-box"
import {
  assertInvertibleLinearTransform,
  type LinearTransform3,
  transformTriangle,
} from "./mesh-orientation"

export function rotatePoint(point: Point3, rotationDeg: Point3): Point3 {
  let { x, y, z } = point

  if (rotationDeg.x !== 0) {
    const rad = (rotationDeg.x * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const newY = y * cos - z * sin
    const newZ = y * sin + z * cos
    y = newY
    z = newZ
  }

  if (rotationDeg.y !== 0) {
    const rad = (rotationDeg.y * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const newX = x * cos + z * sin
    const newZ = -x * sin + z * cos
    x = newX
    z = newZ
  }

  if (rotationDeg.z !== 0) {
    const rad = (rotationDeg.z * Math.PI) / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    const newX = x * cos - y * sin
    const newY = x * sin + y * cos
    x = newX
    y = newY
  }

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

  // Like geometry.transformMesh, scaling is a linear map in the mesh's current
  // frame. Inverse-transpose normals stay perpendicular under unequal scales,
  // and a reflected scale swaps vertex order with its corresponding UVs.
  const matrix: LinearTransform3 = [scale.x, 0, 0, 0, scale.y, 0, 0, 0, scale.z]
  assertInvertibleLinearTransform(matrix)
  const scaledTriangles = mesh.triangles.map((triangle) =>
    transformTriangle(triangle, matrix),
  )

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
  rotationDeg: Point3,
): T {
  if (rotationDeg.x === 0 && rotationDeg.y === 0 && rotationDeg.z === 0) {
    return mesh
  }

  const rotatedTriangles = mesh.triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map((vertex) =>
      rotatePoint(vertex, rotationDeg),
    ) as [Point3, Point3, Point3],
    normal: rotatePoint(triangle.normal, rotationDeg),
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
