import type { OBJMesh, Point3, STLMesh, Triangle } from "../types"

function scalePoint(point: Point3, scale: number): Point3 {
  return {
    x: point.x * scale,
    y: point.y * scale,
    z: point.z * scale,
  }
}

function scaleTriangle(triangle: Triangle, scale: number): Triangle {
  return {
    ...triangle,
    vertices: triangle.vertices.map((vertex) => scalePoint(vertex, scale)) as [
      Point3,
      Point3,
      Point3,
    ],
  }
}

export function scaleMesh<T extends STLMesh | OBJMesh>(
  mesh: T,
  scale: number,
): T {
  if (!Number.isFinite(scale) || scale === 1) {
    return mesh
  }

  const scaledTriangles = mesh.triangles.map((triangle) =>
    scaleTriangle(triangle, scale),
  )

  const scaledBoundingBox = {
    min: scalePoint(mesh.boundingBox.min, scale),
    max: scalePoint(mesh.boundingBox.max, scale),
  }

  return {
    ...mesh,
    triangles: scaledTriangles,
    boundingBox: scaledBoundingBox,
  } as T
}
