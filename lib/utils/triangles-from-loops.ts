import earcut from "earcut"
import type { BoundingBox, Point3, STLMesh, Triangle } from "../types"
import type { Vec2Point } from "./geometry-loops"
import { signedArea } from "./geometry-loops"

interface LoopInput {
  points: Vec2Point[]
  isHole: boolean
}

export const buildBoardMeshFromLoops = ({
  outerLoop,
  holeLoops,
  thickness,
}: {
  outerLoop: Vec2Point[]
  holeLoops: Vec2Point[][]
  thickness: number
}): STLMesh => {
  const flattenedVertices: number[] = []
  const holeIndices: number[] = []
  const allLoops: LoopInput[] = []

  pushLoop(flattenedVertices, outerLoop)
  allLoops.push({ points: outerLoop, isHole: false })

  let vertexOffset = outerLoop.length
  for (const holeLoop of holeLoops) {
    if (holeLoop.length < 3) continue
    holeIndices.push(vertexOffset)
    pushLoop(flattenedVertices, holeLoop)
    allLoops.push({ points: holeLoop, isHole: true })
    vertexOffset += holeLoop.length
  }

  const indices = earcut(flattenedVertices, holeIndices, 2)
  const zTop = thickness / 2
  const zBottom = -thickness / 2
  const triangles: Triangle[] = []

  for (let i = 0; i < indices.length; i += 3) {
    const ia = indices[i]!
    let ib = indices[i + 1]!
    let ic = indices[i + 2]!

    const ax = flattenedVertices[ia * 2]!
    const ay = flattenedVertices[ia * 2 + 1]!
    const bx = flattenedVertices[ib * 2]!
    const by = flattenedVertices[ib * 2 + 1]!
    const cx = flattenedVertices[ic * 2]!
    const cy = flattenedVertices[ic * 2 + 1]!

    const crossZ = (bx - ax) * (cy - ay) - (by - ay) * (cx - ax)
    if (crossZ < 0) {
      ;[ib, ic] = [ic, ib]
    }

    const topA = toScenePoint({
      x: flattenedVertices[ia * 2]!,
      y: flattenedVertices[ia * 2 + 1]!,
      z: zTop,
    })
    const topB = toScenePoint({
      x: flattenedVertices[ib * 2]!,
      y: flattenedVertices[ib * 2 + 1]!,
      z: zTop,
    })
    const topC = toScenePoint({
      x: flattenedVertices[ic * 2]!,
      y: flattenedVertices[ic * 2 + 1]!,
      z: zTop,
    })
    triangles.push(makeTriangle({ a: topA, b: topB, c: topC }))

    const bottomA = toScenePoint({
      x: flattenedVertices[ia * 2]!,
      y: flattenedVertices[ia * 2 + 1]!,
      z: zBottom,
    })
    const bottomB = toScenePoint({
      x: flattenedVertices[ib * 2]!,
      y: flattenedVertices[ib * 2 + 1]!,
      z: zBottom,
    })
    const bottomC = toScenePoint({
      x: flattenedVertices[ic * 2]!,
      y: flattenedVertices[ic * 2 + 1]!,
      z: zBottom,
    })
    triangles.push(makeTriangle({ a: bottomA, b: bottomC, c: bottomB }))
  }

  for (const { points, isHole } of allLoops) {
    addLoopSideWalls({ triangles, loop: points, zTop, zBottom, isHole })
  }

  return {
    triangles,
    boundingBox: computeBoundingBox(triangles),
  }
}

const pushLoop = (flattenedVertices: number[], loop: Vec2Point[]): void => {
  for (const p of loop) {
    flattenedVertices.push(p.x, p.y)
  }
}

const toScenePoint = ({
  x,
  y,
  z,
}: {
  x: number
  y: number
  z: number
}): Point3 => ({
  x,
  y: z,
  z: -y,
})

const makeTriangle = ({
  a,
  b,
  c,
}: {
  a: Point3
  b: Point3
  c: Point3
}): Triangle => {
  const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
  const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
  const cross = {
    x: ab.y * ac.z - ab.z * ac.y,
    y: ab.z * ac.x - ab.x * ac.z,
    z: ab.x * ac.y - ab.y * ac.x,
  }
  const length = Math.hypot(cross.x, cross.y, cross.z) || 1

  return {
    vertices: [a, b, c],
    normal: {
      x: cross.x / length,
      y: cross.y / length,
      z: cross.z / length,
    },
  }
}

const addLoopSideWalls = ({
  triangles,
  loop,
  zTop,
  zBottom,
  isHole,
}: {
  triangles: Triangle[]
  loop: Vec2Point[]
  zTop: number
  zBottom: number
  isHole: boolean
}): void => {
  if (loop.length < 2) return

  const isCounterClockwise = signedArea(loop) > 0
  const invert = isHole ? isCounterClockwise : !isCounterClockwise

  for (let i = 0; i < loop.length; i++) {
    const a = loop[i]!
    const b = loop[(i + 1) % loop.length]!
    const topA = toScenePoint({ x: a.x, y: a.y, z: zTop })
    const topB = toScenePoint({ x: b.x, y: b.y, z: zTop })
    const bottomA = toScenePoint({ x: a.x, y: a.y, z: zBottom })
    const bottomB = toScenePoint({ x: b.x, y: b.y, z: zBottom })

    if (invert) {
      triangles.push(makeTriangle({ a: topA, b: topB, c: bottomB }))
      triangles.push(makeTriangle({ a: topA, b: bottomB, c: bottomA }))
    } else {
      triangles.push(makeTriangle({ a: topA, b: bottomB, c: topB }))
      triangles.push(makeTriangle({ a: topA, b: bottomA, c: bottomB }))
    }
  }
}

const computeBoundingBox = (triangles: Triangle[]): BoundingBox => {
  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity

  for (const triangle of triangles) {
    for (const vertex of triangle.vertices) {
      minX = Math.min(minX, vertex.x)
      minY = Math.min(minY, vertex.y)
      minZ = Math.min(minZ, vertex.z)
      maxX = Math.max(maxX, vertex.x)
      maxY = Math.max(maxY, vertex.y)
      maxZ = Math.max(maxZ, vertex.z)
    }
  }

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ },
  }
}
