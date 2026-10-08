import type { Point3, Triangle } from "../types"

/** Row-major linear map between any two 3D frames, with no translation.
 * Points and directions use the same axes; lengths retain the caller's units.
 */
export type LinearTransform3 = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

export function getLinearTransformDeterminant(m: LinearTransform3): number {
  return (
    m[0] * (m[4] * m[8] - m[5] * m[7]) -
    m[1] * (m[3] * m[8] - m[5] * m[6]) +
    m[2] * (m[3] * m[7] - m[4] * m[6])
  )
}

/** A collapsed or nonfinite map cannot preserve a surface's orientation. */
export function assertInvertibleLinearTransform(m: LinearTransform3): void {
  const determinant = getLinearTransformDeterminant(m)
  if (!Number.isFinite(determinant) || determinant === 0) {
    throw new RangeError(
      "Mesh transform must have a finite, nonzero determinant",
    )
  }
}

/** Apply a linear map to a point or direction, without translation. */
export function applyLinearTransform(p: Point3, m: LinearTransform3): Point3 {
  return {
    x: m[0] * p.x + m[1] * p.y + m[2] * p.z,
    y: m[3] * p.x + m[4] * p.y + m[5] * p.z,
    z: m[6] * p.x + m[7] * p.y + m[8] * p.z,
  }
}

/** Extract an affine map's linear part by removing its transformed origin.
 * This also accepts a point transform that includes translation; normals must
 * never receive that translation.
 */
export function linearTransformFromPointTransform(
  transform: (point: Point3) => Point3,
): LinearTransform3 {
  const origin = transform({ x: 0, y: 0, z: 0 })
  const x = transform({ x: 1, y: 0, z: 0 })
  const y = transform({ x: 0, y: 1, z: 0 })
  const z = transform({ x: 0, y: 0, z: 1 })
  return [
    x.x - origin.x,
    y.x - origin.x,
    z.x - origin.x,
    x.y - origin.y,
    y.y - origin.y,
    z.y - origin.y,
    x.z - origin.z,
    y.z - origin.z,
    z.z - origin.z,
  ]
}

/** Map a surface normal (direction) with the inverse transpose, then normalize.
 * A zero source normal stays zero. Singular maps throw because the inverse
 * transpose and an outward orientation are undefined for collapsed surfaces.
 */
export function transformNormal(n: Point3, m: LinearTransform3): Point3 {
  assertInvertibleLinearTransform(m)
  // The cofactor matrix is det(M) * inverse-transpose(M). Dividing by only
  // the determinant's sign before normalization avoids amplifying tiny scales.
  const sign = Math.sign(getLinearTransformDeterminant(m))
  const x =
    sign *
    ((m[4] * m[8] - m[5] * m[7]) * n.x +
      (m[5] * m[6] - m[3] * m[8]) * n.y +
      (m[3] * m[7] - m[4] * m[6]) * n.z)
  const y =
    sign *
    ((m[2] * m[7] - m[1] * m[8]) * n.x +
      (m[0] * m[8] - m[2] * m[6]) * n.y +
      (m[1] * m[6] - m[0] * m[7]) * n.z)
  const z =
    sign *
    ((m[1] * m[5] - m[2] * m[4]) * n.x +
      (m[2] * m[3] - m[0] * m[5]) * n.y +
      (m[0] * m[4] - m[1] * m[3]) * n.z)
  const length = Math.hypot(x, y, z)
  return length === 0
    ? { x: 0, y: 0, z: 0 }
    : {
        x: x / length,
        y: y / length,
        z: z / length,
      }
}

/** Preserve outward winding, normals and vertex UV associations in any frame.
 * Like pcb-fold.swapMeshFrame, a reflection swaps the last two vertices once;
 * rotations and positive scales keep their order. Source records are untouched.
 */
export function transformTriangle(t: Triangle, m: LinearTransform3): Triangle {
  assertInvertibleLinearTransform(m)
  const reflected = getLinearTransformDeterminant(m) < 0
  const order = reflected ? ([0, 2, 1] as const) : ([0, 1, 2] as const)
  return {
    ...t,
    vertices: order.map((i) =>
      applyLinearTransform(t.vertices[i], m),
    ) as Triangle["vertices"],
    normal: transformNormal(t.normal, m),
    ...(t.uvs ? { uvs: order.map((i) => t.uvs![i]) as Triangle["uvs"] } : {}),
  }
}
