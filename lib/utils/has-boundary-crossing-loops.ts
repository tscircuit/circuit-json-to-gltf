import type { Vec2Point } from "./geometry-loops"

const LOOP_CONTAINMENT_EPSILON = 1e-8

/** Earcut requires disjoint holes. Conservatively use the existing boolean
 * subtraction when hole bounds overlap, so merged drills have no interior wall. */
export const hasOverlappingHoleLoops = (loops: Vec2Point[][]): boolean => {
  const bounds = loops
    .map((loop) => ({
      minX: Math.min(...loop.map((p) => p.x)),
      maxX: Math.max(...loop.map((p) => p.x)),
      minY: Math.min(...loop.map((p) => p.y)),
      maxY: Math.max(...loop.map((p) => p.y)),
    }))
    .sort((a, b) => a.minX - b.minX)
  for (let i = 0; i < bounds.length; i++) {
    const a = bounds[i]!
    for (let j = i + 1; j < bounds.length; j++) {
      const b = bounds[j]!
      if (b.minX > a.maxX) break
      if (b.minY <= a.maxY && b.maxY >= a.minY) return true
    }
  }
  return false
}

export const hasBoundaryCrossingLoops = (
  outerLoop: Vec2Point[],
  innerLoops: Vec2Point[][],
): boolean => {
  return innerLoops.some(
    (loop) =>
      loop.some((point) => !isPointStrictlyInsideLoop(point, outerLoop)) ||
      outerLoop.some((point) => isPointInsideOrOnLoop(point, loop)) ||
      doLoopSegmentsIntersect(loop, outerLoop),
  )
}

const isPointInsideOrOnLoop = (
  point: Vec2Point,
  loop: Vec2Point[],
): boolean => {
  for (let i = 0, j = loop.length - 1; i < loop.length; j = i++) {
    if (isPointOnSegment(point, loop[i]!, loop[j]!)) {
      return true
    }
  }
  return isPointStrictlyInsideLoop(point, loop)
}

const crossProduct = (o: Vec2Point, a: Vec2Point, b: Vec2Point): number =>
  (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)

const doSegmentsIntersect = (
  a1: Vec2Point,
  a2: Vec2Point,
  b1: Vec2Point,
  b2: Vec2Point,
): boolean => {
  if (
    isPointOnSegment(a1, b1, b2) ||
    isPointOnSegment(a2, b1, b2) ||
    isPointOnSegment(b1, a1, a2) ||
    isPointOnSegment(b2, a1, a2)
  ) {
    return true
  }

  const d1 = crossProduct(b1, b2, a1)
  const d2 = crossProduct(b1, b2, a2)
  const d3 = crossProduct(a1, a2, b1)
  const d4 = crossProduct(a1, a2, b2)

  return (
    ((d1 > LOOP_CONTAINMENT_EPSILON && d2 < -LOOP_CONTAINMENT_EPSILON) ||
      (d1 < -LOOP_CONTAINMENT_EPSILON && d2 > LOOP_CONTAINMENT_EPSILON)) &&
    ((d3 > LOOP_CONTAINMENT_EPSILON && d4 < -LOOP_CONTAINMENT_EPSILON) ||
      (d3 < -LOOP_CONTAINMENT_EPSILON && d4 > LOOP_CONTAINMENT_EPSILON))
  )
}

const doLoopSegmentsIntersect = (
  loopA: Vec2Point[],
  loopB: Vec2Point[],
): boolean => {
  for (let i = 0; i < loopA.length; i++) {
    const a1 = loopA[i]!
    const a2 = loopA[(i + 1) % loopA.length]!
    for (let j = 0; j < loopB.length; j++) {
      const b1 = loopB[j]!
      const b2 = loopB[(j + 1) % loopB.length]!
      if (doSegmentsIntersect(a1, a2, b1, b2)) {
        return true
      }
    }
  }
  return false
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
