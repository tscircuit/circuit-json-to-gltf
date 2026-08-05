import type { BoundingBox, Triangle } from "../types"

const ZERO_BOX = (): BoundingBox => ({
  min: { x: 0, y: 0, z: 0 },
  max: { x: 0, y: 0, z: 0 },
})

/**
 * Accumulates the axis-aligned extremes of a point stream.
 *
 * The scan is trivial; what is worth stating once is what happens at the edges,
 * because every copy of this loop had to re-decide it:
 *
 * - **No points at all** report a zero box. An unguarded min/max leaves
 *   Infinity/-Infinity, which serializes to null and reads downstream as a mesh
 *   of infinite size.
 * - **Non-finite points are not points.** A vertex carrying NaN or Infinity --
 *   from a malformed OBJ/STL, or a degenerate transform -- is skipped whole,
 *   rather than being folded in per axis. Folding it in poisons the box for
 *   every later consumer (a glTF accessor's min/max would be NaN, which is
 *   invalid glTF); skipping only the offending axis would report a box mixing a
 *   real extent on one axis with a fabricated one on another.
 *
 * A stream whose points are all non-finite is therefore empty, and reports the
 * zero box.
 */
const createBoundsAccumulator = () => {
  let minX = Number.POSITIVE_INFINITY
  let minY = Number.POSITIVE_INFINITY
  let minZ = Number.POSITIVE_INFINITY
  let maxX = Number.NEGATIVE_INFINITY
  let maxY = Number.NEGATIVE_INFINITY
  let maxZ = Number.NEGATIVE_INFINITY
  let isEmpty = true

  return {
    add(x: number, y: number, z: number) {
      if (!Number.isFinite(x) || !Number.isFinite(y) || !Number.isFinite(z)) {
        return
      }
      isEmpty = false
      if (x < minX) minX = x
      if (y < minY) minY = y
      if (z < minZ) minZ = z
      if (x > maxX) maxX = x
      if (y > maxY) maxY = y
      if (z > maxZ) maxZ = z
    },
    result(): BoundingBox {
      if (isEmpty) return ZERO_BOX()
      return {
        min: { x: minX, y: minY, z: minZ },
        max: { x: maxX, y: maxY, z: maxZ },
      }
    },
  }
}

/**
 * Axis-aligned bounds of a triangle list.
 *
 * Measuring the triangles a mesh actually ships is exact for any frame they
 * have been transformed into, which measuring the source geometry and moving
 * its box is not: a box only survives a transform intact when the geometry
 * fills it, so a rotation applied to the box inflates the empty corners of a
 * cylinder or a sloped part instead of following the shape.
 *
 * An empty list reports a zero box rather than Infinity, keeping the value
 * serializable.
 */
export const boundsOfTriangles = (triangles: Triangle[]): BoundingBox => {
  const bounds = createBoundsAccumulator()
  for (const triangle of triangles) {
    for (const vertex of triangle.vertices) {
      bounds.add(vertex.x, vertex.y, vertex.z)
    }
  }
  return bounds.result()
}

/**
 * Axis-aligned bounds of a flat `[x, y, z, x, y, z, ...]` position array, the
 * layout glTF accessors use. Same rules as `boundsOfTriangles`.
 *
 * A trailing partial triple is ignored rather than read past the end of the
 * array, where the missing components come back `undefined` and turn the whole
 * box into NaN on those axes.
 */
export const boundsOfPositions = (positions: number[]): BoundingBox => {
  const bounds = createBoundsAccumulator()
  for (let i = 0; i + 2 < positions.length; i += 3) {
    bounds.add(positions[i]!, positions[i + 1]!, positions[i + 2]!)
  }
  return bounds.result()
}
