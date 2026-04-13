import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import type { Geom3 } from "@jscad/modeling/src/geometries/types"
import type { Vec2 } from "@jscad/modeling/src/maths/types"
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions"
import {
  rotateX,
  rotateZ,
  translate,
} from "@jscad/modeling/src/operations/transforms"
import {
  polygon,
  rectangle,
  roundedRectangle,
} from "@jscad/modeling/src/primitives"
import type {
  PcbPlatedHole,
  PcbBoard,
  PcbHole,
  PcbPanel,
  Point,
} from "circuit-json"
import type { BoundingBox, STLMesh, Triangle } from "../types"
import { normalizeLoop, signedArea, type Vec2Point } from "./geometry-loops"
import type { BoardCutout } from "./pcb-board-cutouts"
import {
  arePointsClockwise,
  createCircularHole,
  DEFAULT_QUALITY_MODE_SEGMENTS,
  HIGH_QUALITY_MODE_REDUCED_SEGMENTS,
  HIGH_QUALITY_MODE_SEGMENTS,
  HOLE_COUNT_THRESHOLD,
  REDUCED_QUALITY_MODE_SEGMENTS,
} from "./pcb-board-cutouts"
import { createCutoutLoops } from "./pcb-cutout-loops"
import { createHoleLoops } from "./pcb-hole-loops"
import { buildBoardMeshFromLoops } from "./triangles-from-loops"

const RADIUS_EPSILON = 1e-4

export type { BoardCutout } from "./pcb-board-cutouts"
export { arePointsClockwise } from "./pcb-board-cutouts"

export interface BoardGeometryOptions {
  thickness: number
  holes?: PcbHole[]
  platedHoles?: PcbPlatedHole[]
  cutouts?: BoardCutout[]
  drillQuality?: "high" | "fast"
}

const getHoleSegments = (
  totalHoleCount: number,
  drillQuality: "high" | "fast",
): number => {
  if (drillQuality === "high") {
    return totalHoleCount > HOLE_COUNT_THRESHOLD
      ? HIGH_QUALITY_MODE_REDUCED_SEGMENTS
      : HIGH_QUALITY_MODE_SEGMENTS
  }
  return totalHoleCount > HOLE_COUNT_THRESHOLD
    ? REDUCED_QUALITY_MODE_SEGMENTS
    : DEFAULT_QUALITY_MODE_SEGMENTS
}

const getNumberProperty = (
  obj: Record<string, unknown>,
  key: string,
): number | undefined => {
  const value = obj[key]
  return typeof value === "number" ? value : undefined
}

export const createBoardOutlineGeom = (
  board: PcbPanel | PcbBoard,
  center: { x: number; y: number },
  thickness: number,
): Geom3 => {
  const outline = "outline" in board ? board.outline : undefined
  if (outline && outline.length >= 3) {
    let outlinePoints: Vec2[] = outline.map((pt: Point) => [
      pt.x - center.x,
      -(pt.y - center.y),
    ])

    if (arePointsClockwise(outlinePoints)) {
      outlinePoints = outlinePoints.slice().reverse()
    }

    const shape2d = polygon({ points: outlinePoints })
    let geom = extrudeLinear({ height: thickness }, shape2d)
    geom = translate([0, 0, -thickness / 2], geom)
    return geom
  }

  const baseRect = rectangle({ size: [board.width!, board.height!] })
  let geom = extrudeLinear({ height: thickness }, baseRect)
  geom = translate([0, 0, -thickness / 2], geom)
  return geom
}

const createPillHoleWithSegments = (
  x: number,
  y: number,
  width: number,
  height: number,
  thickness: number,
  rotationRad: number = 0,
  segments: number = DEFAULT_QUALITY_MODE_SEGMENTS,
): Geom3 => {
  const minDimension = Math.min(width, height)
  const maxAllowedRadius = Math.max(0, minDimension / 2 - RADIUS_EPSILON)
  const roundRadius =
    maxAllowedRadius <= 0 ? 0 : Math.min(height / 2, maxAllowedRadius)
  const hole2d = roundedRectangle({
    size: [width, height],
    roundRadius,
    segments,
  })
  let hole3d = extrudeLinear({ height: thickness + 1 }, hole2d)
  hole3d = translate([0, 0, -(thickness + 1) / 2], hole3d)

  if (rotationRad !== 0) {
    hole3d = rotateZ(rotationRad, hole3d)
  }

  return translate([x, y, 0], hole3d)
}

export const createHoleGeoms = (
  boardCenter: { x: number; y: number },
  thickness: number,
  holes: PcbHole[] = [],
  platedHoles: PcbPlatedHole[] = [],
  segments: number = DEFAULT_QUALITY_MODE_SEGMENTS,
): Geom3[] => {
  const holeGeoms: Geom3[] = []

  for (const hole of holes) {
    const holeRecord = hole as unknown as Record<string, unknown>
    const relX = hole.x - boardCenter.x
    const relY = -(hole.y - boardCenter.y)
    const holeShape = holeRecord.hole_shape as string | undefined

    if (holeShape === "pill") {
      const holeWidth = getNumberProperty(holeRecord, "hole_width")
      const holeHeight = getNumberProperty(holeRecord, "hole_height")
      if (!holeWidth || !holeHeight) continue

      const rotate = holeHeight > holeWidth
      const width = rotate ? holeHeight : holeWidth
      const height = rotate ? holeWidth : holeHeight
      holeGeoms.push(
        createPillHoleWithSegments(
          relX,
          relY,
          width,
          height,
          thickness,
          rotate ? Math.PI / 2 : 0,
          segments,
        ),
      )
      continue
    }

    if (holeShape === "rotated_pill") {
      const holeWidth = getNumberProperty(holeRecord, "hole_width")
      const holeHeight = getNumberProperty(holeRecord, "hole_height")
      if (!holeWidth || !holeHeight) continue

      const rotation = getNumberProperty(holeRecord, "ccw_rotation") ?? 0
      const rotationRad = -(rotation * Math.PI) / 180
      holeGeoms.push(
        createPillHoleWithSegments(
          relX,
          relY,
          holeWidth,
          holeHeight,
          thickness,
          rotationRad,
          segments,
        ),
      )
      continue
    }

    const diameter =
      getNumberProperty(holeRecord, "hole_diameter") ??
      getNumberProperty(holeRecord, "diameter")
    if (!diameter) continue

    holeGeoms.push(
      createCircularHole(relX, relY, diameter / 2, thickness, segments),
    )
  }

  for (const plated of platedHoles) {
    const platedRecord = plated as unknown as Record<string, unknown>
    const holeOffsetX = getNumberProperty(platedRecord, "hole_offset_x") ?? 0
    const holeOffsetY = getNumberProperty(platedRecord, "hole_offset_y") ?? 0
    const relX = plated.x - boardCenter.x + holeOffsetX
    const relY = -(plated.y - boardCenter.y + holeOffsetY)

    if (plated.shape === "pill" || plated.shape === "pill_hole_with_rect_pad") {
      const holeWidth =
        getNumberProperty(platedRecord, "hole_width") ??
        getNumberProperty(platedRecord, "outer_diameter") ??
        0
      const holeHeight =
        getNumberProperty(platedRecord, "hole_height") ??
        getNumberProperty(platedRecord, "hole_diameter") ??
        0
      if (!holeWidth || !holeHeight) continue

      const rotation = getNumberProperty(platedRecord, "ccw_rotation") ?? 0
      const rotationRad = -(rotation * Math.PI) / 180
      holeGeoms.push(
        createPillHoleWithSegments(
          relX,
          relY,
          holeWidth,
          holeHeight,
          thickness,
          rotationRad,
          segments,
        ),
      )
      continue
    }

    const diameter =
      getNumberProperty(platedRecord, "hole_diameter") ??
      getNumberProperty(platedRecord, "outer_diameter")
    if (!diameter) continue

    holeGeoms.push(
      createCircularHole(relX, relY, diameter / 2, thickness, segments),
    )
  }

  return holeGeoms
}

export const geom3ToTriangles = (
  geometry: Geom3,
  polygons?: any[],
): Triangle[] => {
  const sourcePolygons = polygons ?? geom3.toPolygons(geometry)
  const triangles: Triangle[] = []

  for (const poly of sourcePolygons) {
    if (!poly || poly.vertices.length < 3) continue
    const base = poly.vertices[0]!
    const next = poly.vertices[1]!
    const next2 = poly.vertices[2]!

    const ab = [next[0]! - base[0]!, next[1]! - base[1]!, next[2]! - base[2]!]
    const ac = [
      next2[0]! - base[0]!,
      next2[1]! - base[1]!,
      next2[2]! - base[2]!,
    ]
    const cross = [
      ab[1]! * ac[2]! - ab[2]! * ac[1]!,
      ab[2]! * ac[0]! - ab[0]! * ac[2]!,
      ab[0]! * ac[1]! - ab[1]! * ac[0]!,
    ]
    const length =
      Math.sqrt(cross[0]! ** 2 + cross[1]! ** 2 + cross[2]! ** 2) || 1
    const normal = {
      x: cross[0]! / length,
      y: cross[1]! / length,
      z: cross[2]! / length,
    }

    for (let i = 1; i < poly.vertices.length - 1; i++) {
      const v1 = poly.vertices[i]!
      const v2 = poly.vertices[i + 1]!
      triangles.push({
        vertices: [
          { x: base[0]!, y: base[1]!, z: base[2]! },
          { x: v1[0]!, y: v1[1]!, z: v1[2]! },
          { x: v2[0]!, y: v2[1]!, z: v2[2]! },
        ],
        normal,
      })
    }
  }

  return triangles
}

export const createBoundingBox = (bbox: [number[], number[]]): BoundingBox => {
  const [min, max] = bbox
  return {
    min: { x: min[0]!, y: min[1]!, z: min[2]! },
    max: { x: max[0]!, y: max[1]!, z: max[2]! },
  }
}

export const createBoardMesh = (
  board: PcbPanel | PcbBoard,
  options: BoardGeometryOptions,
): STLMesh => {
  const {
    thickness,
    holes = [],
    platedHoles = [],
    cutouts = [],
    drillQuality = "fast",
  } = options

  const center = board.center ?? { x: 0, y: 0 }
  const totalHoleCount = holes.length + platedHoles.length
  const segments = getHoleSegments(totalHoleCount, drillQuality)

  const outerLoop = createBoardOuterLoop(board, center)
  const holeLoops = [
    ...createHoleLoops({
      boardCenter: center,
      holes,
      platedHoles,
      segments,
    }),
    ...createCutoutLoops({
      boardCenter: center,
      cutouts,
      segments,
    }),
  ]

  return buildBoardMeshFromLoops({ outerLoop, holeLoops, thickness })
}

const createBoardOuterLoop = (
  board: PcbPanel | PcbBoard,
  center: { x: number; y: number },
): Vec2Point[] => {
  const outline = "outline" in board ? board.outline : undefined
  if (outline && outline.length >= 3) {
    let points = outline.map((pt: Point) => ({
      x: pt.x - center.x,
      y: -(pt.y - center.y),
    }))

    if (signedArea(points) < 0) points = points.slice().reverse()
    return normalizeLoop(points)
  }

  const width = board.width!
  const height = board.height!
  return normalizeLoop([
    { x: -width / 2, y: -height / 2 },
    { x: width / 2, y: -height / 2 },
    { x: width / 2, y: height / 2 },
    { x: -width / 2, y: height / 2 },
  ])
}
