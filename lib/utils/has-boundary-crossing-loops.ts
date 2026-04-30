import type { Vec2Point } from "./geometry-loops"

const LOOP_CONTAINMENT_EPSILON = 1e-8

export const hasBoundaryCrossingLoops = (
  outerLoop: Vec2Point[],
  innerLoops: Vec2Point[][],
): boolean => {
  return innerLoops.some((loop) =>
    loop.some((point) => !isPointStrictlyInsideLoop(point, outerLoop)),
  )
}

const isPointStrictlyInsideLoop = (
  point: Vec2Point,
  loop: Vec2Point[],
): boolean => {
  let inside = false

  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    const a = loop[i]!
    const b = loop[j]!

    if (isPointOnSegment(point, a, b)) {
      return false
    }

    const intersects =
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x

    if (intersects) {
      inside = !inside
    }
  }

  return inside
}

const isPointOnSegment = (
  point: Vec2Point,
  a: Vec2Point,
  b: Vec2Point,
): boolean => {
  const cross = (point.y - a.y) * (b.x - a.x) - (point.x - a.x) * (b.y - a.y)
  if (Math.abs(cross) > LOOP_CONTAINMENT_EPSILON) return false

  const dot = (point.x - a.x) * (b.x - a.x) + (point.y - a.y) * (b.y - a.y)
  if (dot < -LOOP_CONTAINMENT_EPSILON) return false

  const squaredLength = (b.x - a.x) ** 2 + (b.y - a.y) ** 2
  return dot <= squaredLength + LOOP_CONTAINMENT_EPSILON
}
