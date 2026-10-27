import { NEPS } from "@jscad/modeling/src/maths/constants"
import type { Point3, Triangle } from "../types"

type VertexPositionKey = string
type EdgePositionKey = string

function getVertexKey(point: Point3): VertexPositionKey {
  return [point.x, point.y, point.z]
    .map((coordinate) =>
      Math.abs(coordinate) < NEPS ? 0 : Math.fround(coordinate),
    )
    .join(",")
}

function getEdgeKey(first: Point3, second: Point3): EdgePositionKey {
  return [getVertexKey(first), getVertexKey(second)].sort().join(":")
}

/** Conform JSCAD's Z-up mm surface before its existing frame conversion.
 * Reuse original positions equal at glTF's Float32 precision and subdivide
 * unmatched edges at existing collinear vertices. No caps or hulls are added.
 */
export function conformJscadTriangles(
  triangles: Triangle[],
  epsilon: number,
): Triangle[] {
  const sharedVertices = new Map<VertexPositionKey, Point3>()
  const normalizedTriangles = triangles
    .map((triangle) => ({
      ...triangle,
      vertices: triangle.vertices.map((point) => {
        const key = getVertexKey(point)
        const existingPoint = sharedVertices.get(key)
        if (existingPoint) return existingPoint
        sharedVertices.set(key, point)
        return point
      }) as [Point3, Point3, Point3],
    }))
    .filter(
      (triangle) => new Set(triangle.vertices.map(getVertexKey)).size === 3,
    )
  const edgeCounts = new Map<EdgePositionKey, number>()
  for (const triangle of normalizedTriangles) {
    for (let index = 0; index < 3; index++) {
      const key = getEdgeKey(
        triangle.vertices[index]!,
        triangle.vertices[(index + 1) % 3]!,
      )
      edgeCounts.set(key, (edgeCounts.get(key) ?? 0) + 1)
    }
  }
  const boundaryPoints = new Map<VertexPositionKey, Point3>()
  for (const triangle of normalizedTriangles) {
    for (let index = 0; index < 3; index++) {
      const first = triangle.vertices[index]!
      const second = triangle.vertices[(index + 1) % 3]!
      if (edgeCounts.get(getEdgeKey(first, second)) !== 1) continue
      boundaryPoints.set(getVertexKey(first), first)
      boundaryPoints.set(getVertexKey(second), second)
    }
  }
  if (!boundaryPoints.size) return normalizedTriangles
  return normalizedTriangles.flatMap((triangle) => {
    const perimeter: Point3[] = []
    for (let index = 0; index < 3; index++) {
      const first = triangle.vertices[index]!
      const second = triangle.vertices[(index + 1) % 3]!
      perimeter.push(first)
      if (edgeCounts.get(getEdgeKey(first, second)) !== 1) continue
      const dx = second.x - first.x
      const dy = second.y - first.y
      const dz = second.z - first.z
      const lengthSquared = dx * dx + dy * dy + dz * dz
      if (!lengthSquared) continue
      const interior: { point: Point3; fraction: number }[] = []
      for (const point of boundaryPoints.values()) {
        if (
          getVertexKey(point) === getVertexKey(first) ||
          getVertexKey(point) === getVertexKey(second)
        )
          continue
        const fraction =
          ((point.x - first.x) * dx +
            (point.y - first.y) * dy +
            (point.z - first.z) * dz) /
          lengthSquared
        if (fraction <= 0 || fraction >= 1) continue
        const distanceSquared =
          (point.x - first.x - fraction * dx) ** 2 +
          (point.y - first.y - fraction * dy) ** 2 +
          (point.z - first.z - fraction * dz) ** 2
        if (distanceSquared <= epsilon * epsilon)
          interior.push({ point, fraction })
      }
      interior.sort((left, right) => left.fraction - right.fraction)
      perimeter.push(...interior.map(({ point }) => point))
    }
    if (perimeter.length === 3) return [triangle]
    const center = { x: 0, y: 0, z: 0 }
    for (const point of triangle.vertices) {
      center.x += point.x / 3
      center.y += point.y / 3
      center.z += point.z / 3
    }
    return perimeter.map(
      (point, index): Triangle => ({
        ...triangle,
        vertices: [center, point, perimeter[(index + 1) % perimeter.length]!],
      }),
    )
  })
}
