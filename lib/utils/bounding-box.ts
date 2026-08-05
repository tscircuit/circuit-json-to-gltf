import type { BoundingBox, Triangle } from "../types"

/**
 * Axis-aligned bounds of a triangle list.
 *
 * Measuring the triangles a mesh actually ships is exact for any frame they
 * have been transformed into, which measuring the source geometry and moving
 * its box is not: a box only survives a transform intact when the geometry
 * fills it, so a rotation applied to the box inflates the empty corners of a
 * cylinder or a sloped part instead of following the shape.
 *
 * An empty list reports a zero box rather than Infinity, matching what the
 * STL/OBJ/GLB/STEP loaders report and keeping the value serializable.
 */
export const boundsOfTriangles = (triangles: Triangle[]): BoundingBox => {
  if (triangles.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    }
  }

  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let minZ = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let maxZ = Number.NEGATIVE_INFINITY

  for (const triangle of triangles) {
    for (const vertex of triangle.vertices) {
      if (vertex.x < minX) minX = vertex.x
      if (vertex.y < minY) minY = vertex.y
      if (vertex.z < minZ) minZ = vertex.z
      if (vertex.x > maxX) maxX = vertex.x
      if (vertex.y > maxY) maxY = vertex.y
      if (vertex.z > maxZ) maxZ = vertex.z
    }
  }

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ },
  }
}
