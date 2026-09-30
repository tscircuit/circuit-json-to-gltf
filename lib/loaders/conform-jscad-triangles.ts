import type { Point3, Triangle } from "../types"

/** Keep JSCAD's snapped world-mm surface while subdividing unmatched edges at
 * existing vertices. This closes T-junction topology, never fills an open mesh
 * or adds a surface. The tolerance is the same epsilon used by JSCAD snapping.
 */
export function conformJscadTriangles(
  triangles: Triangle[],
  epsilon: number,
): Triangle[] {
  const key = (p: Point3) => [p.x, p.y, p.z].map(Math.fround).join(",")
  const edgeKey = (a: Point3, b: Point3) => [key(a), key(b)].sort().join(":")
  const counts = new Map<string, number>()
  for (const triangle of triangles)
    for (let i = 0; i < 3; i++) {
      const edge = edgeKey(
        triangle.vertices[i]!,
        triangle.vertices[(i + 1) % 3]!,
      )
      counts.set(edge, (counts.get(edge) ?? 0) + 1)
    }
  const boundaryPoints = new Map<string, Point3>()
  for (const triangle of triangles)
    for (let i = 0; i < 3; i++) {
      const a = triangle.vertices[i]!,
        b = triangle.vertices[(i + 1) % 3]!
      if (counts.get(edgeKey(a, b)) === 1) {
        boundaryPoints.set(key(a), a)
        boundaryPoints.set(key(b), b)
      }
    }
  if (!boundaryPoints.size) return triangles
  return triangles.flatMap((triangle) => {
    const perimeter: Point3[] = []
    let split = false
    for (let i = 0; i < 3; i++) {
      const a = triangle.vertices[i]!,
        b = triangle.vertices[(i + 1) % 3]!
      perimeter.push(a)
      if (counts.get(edgeKey(a, b)) !== 1) continue
      const dx = b.x - a.x,
        dy = b.y - a.y,
        dz = b.z - a.z,
        length2 = dx * dx + dy * dy + dz * dz
      if (!length2) continue
      const interior: { point: Point3; t: number }[] = []
      for (const p of boundaryPoints.values()) {
        if (key(p) === key(a) || key(p) === key(b)) continue
        const t =
          ((p.x - a.x) * dx + (p.y - a.y) * dy + (p.z - a.z) * dz) / length2
        if (t <= 0 || t >= 1) continue
        const distance2 =
          (p.x - a.x - t * dx) ** 2 +
          (p.y - a.y - t * dy) ** 2 +
          (p.z - a.z - t * dz) ** 2
        if (distance2 <= epsilon * epsilon) interior.push({ point: p, t })
      }
      interior.sort((left, right) => left.t - right.t)
      if (interior.length) {
        split = true
        perimeter.push(...interior.map((p) => p.point))
      }
    }
    if (!split) return [triangle]
    const center = { x: 0, y: 0, z: 0 }
    for (const p of triangle.vertices) {
      center.x += p.x / 3
      center.y += p.y / 3
      center.z += p.z / 3
    }
    return perimeter.map(
      (a, i): Triangle => ({
        ...triangle,
        vertices: [center, a, perimeter[(i + 1) % perimeter.length]!],
      }),
    )
  })
}
