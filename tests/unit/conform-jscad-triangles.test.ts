import { expect, test } from "bun:test"
import type { Triangle, Point3 } from "../../lib/types"
import { conformJscadTriangles } from "../../lib/loaders/conform-jscad-triangles"
const triangle = (a: Point3, b: Point3, c: Point3): Triangle => ({
  vertices: [a, b, c],
  normal: { x: 0, y: 0, z: 1 },
})
const p = (x: number, y: number, z = 0): Point3 => ({ x, y, z })
function boundaryEdges(triangles: Triangle[]) {
  const edges = new Map<string, number>()
  for (const t of triangles)
    for (let i = 0; i < 3; i++) {
      const key = [t.vertices[i]!, t.vertices[(i + 1) % 3]!]
        .map((p) => [p.x, p.y, p.z].join(","))
        .sort()
        .join(":")
      edges.set(key, (edges.get(key) ?? 0) + 1)
    }
  return [...edges].filter(([, count]) => count === 1)
}
test("existing near-collinear T junctions subdivide a surface without filling an open mesh", () => {
  const a = p(0, 0),
    b = p(2, 0),
    mid = p(1, 0.00001),
    upper = p(1, 1),
    lower = p(1, -1)
  const soup = [
    triangle(a, b, upper),
    triangle(b, mid, lower),
    triangle(mid, a, lower),
  ]
  const conformed = conformJscadTriangles(soup, 0.00002)
  expect(boundaryEdges(conformed)).toHaveLength(4)
  expect(conformed.flatMap((t) => t.vertices)).toContainEqual(mid)
  // The outside perimeter stays open: no guessed cap, hull, or replacement solid.
  expect(conformed.every((t) => t.vertices.every((p) => p.z === 0))).toBe(true)
  expect(conformJscadTriangles([triangle(a, b, upper)], 0.00002)).toHaveLength(
    1,
  )
})
