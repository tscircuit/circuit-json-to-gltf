import type { Geom3 } from "@jscad/modeling/src/geometries/types"
import type { Vec2 } from "@jscad/modeling/src/maths/types"
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions"
import { rotateZ, translate } from "@jscad/modeling/src/operations/transforms"
import { cylinder, polygon, rectangle } from "@jscad/modeling/src/primitives"
import type { PcbBoard, PcbCutout, Point } from "circuit-json"

// Default drill quality segment counts ("fast")
export const DEFAULT_QUALITY_MODE_SEGMENTS = 24
export const REDUCED_QUALITY_MODE_SEGMENTS = 8

// High drill quality segment counts
export const HIGH_QUALITY_MODE_SEGMENTS = 64
export const HIGH_QUALITY_MODE_REDUCED_SEGMENTS = 16

// Threshold for when to use reduced segments
export const HOLE_COUNT_THRESHOLD = 50

export const toBoardSpaceVec2 = (
  point: Point,
  center: { x: number; y: number },
): Vec2 => [point.x - center.x, -(point.y - center.y)]

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value)

export const getCutoutRotationRadians = (rotation: unknown): number => {
  if (typeof rotation === "number" && Number.isFinite(rotation)) {
    return (rotation * Math.PI) / 180
  }

  if (rotation && typeof rotation === "object") {
    const record = rotation as Record<string, unknown>
    const degreeCandidate = [
      record.deg,
      record.degs,
      record.degree,
      record.degrees,
      record.ccw,
      record.ccw_degrees,
      record.ccw_degree,
    ].find(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    )

    if (degreeCandidate !== undefined) {
      return (degreeCandidate * Math.PI) / 180
    }

    const radCandidate = [
      record.rad,
      record.rads,
      record.radian,
      record.radians,
      record.ccw_radians,
    ].find(
      (value): value is number =>
        typeof value === "number" && Number.isFinite(value),
    )

    if (radCandidate !== undefined) {
      return radCandidate
    }
  }

  return 0
}

export const arePointsClockwise = (points: Vec2[]): boolean => {
  let area = 0
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length
    area += points[i]![0] * points[j]![1]
    area -= points[j]![0] * points[i]![1]
  }
  const signedArea = area / 2
  return signedArea <= 0
}

export type BoardCutout = PcbCutout

export const createCircularHole = (
  x: number,
  y: number,
  radius: number,
  thickness: number,
  segments: number = DEFAULT_QUALITY_MODE_SEGMENTS,
): Geom3 =>
  cylinder({
    center: [x, y, 0],
    height: thickness + 1,
    radius,
    segments,
  })

export const createCutoutGeoms = (
  boardCenter: { x: number; y: number },
  thickness: number,
  cutouts: BoardCutout[] = [],
  segments: number = DEFAULT_QUALITY_MODE_SEGMENTS,
): Geom3[] => {
  const geoms: Geom3[] = []

  for (const cutout of cutouts) {
    if (!cutout) continue

    switch (cutout.shape) {
      case "rect": {
        const { center } = cutout
        if (!center || !isFiniteNumber(center.x) || !isFiniteNumber(center.y)) {
          continue
        }

        const width =
          typeof cutout.width === "number" && Number.isFinite(cutout.width)
            ? cutout.width
            : undefined
        const height =
          typeof cutout.height === "number" && Number.isFinite(cutout.height)
            ? cutout.height
            : undefined
        if (!width || !height) continue

        const relX = center.x - boardCenter.x
        const relY = -(center.y - boardCenter.y)

        const rect2d = rectangle({ size: [width, height] })
        let geom = extrudeLinear({ height: thickness + 1 }, rect2d)
        geom = translate([0, 0, -(thickness + 1) / 2], geom)

        const rotationRad = getCutoutRotationRadians(cutout.rotation)
        if (rotationRad) {
          geom = rotateZ(-rotationRad, geom)
        }

        geoms.push(translate([relX, relY, 0], geom))
        break
      }
      case "circle": {
        const { center } = cutout
        if (!center || !isFiniteNumber(center.x) || !isFiniteNumber(center.y)) {
          continue
        }

        const radius = (() => {
          if (
            typeof cutout.radius === "number" &&
            Number.isFinite(cutout.radius)
          ) {
            return cutout.radius
          }

          if (
            "diameter" in cutout &&
            typeof cutout.diameter === "number" &&
            Number.isFinite(cutout.diameter)
          ) {
            return cutout.diameter / 2
          }

          return undefined
        })()

        if (!radius) continue

        const relX = center.x - boardCenter.x
        const relY = -(center.y - boardCenter.y)

        geoms.push(createCircularHole(relX, relY, radius, thickness, segments))
        break
      }
      case "polygon": {
        const { points } = cutout
        if (!Array.isArray(points) || points.length < 3) continue

        let polygonPoints = points
          .filter(
            (point): point is Point =>
              point !== undefined &&
              isFiniteNumber(point.x) &&
              isFiniteNumber(point.y),
          )
          .map((point) => toBoardSpaceVec2(point, boardCenter))

        if (polygonPoints.length < 3) continue

        if (arePointsClockwise(polygonPoints)) {
          polygonPoints = polygonPoints.slice().reverse()
        }

        const polygon2d = polygon({ points: polygonPoints })
        let geom = extrudeLinear({ height: thickness + 1 }, polygon2d)
        geom = translate([0, 0, -(thickness + 1) / 2], geom)
        geoms.push(geom)
        break
      }
      default:
        break
    }
  }

  return geoms
}

/**
 * Filter cutouts to only include those applicable to a specific board
 */
export const filterCutoutsForBoard = (
  cutouts: PcbCutout[],
  board: PcbBoard,
): PcbCutout[] => {
  return cutouts.filter((cutout) => {
    return !cutout.pcb_board_id || cutout.pcb_board_id === board.pcb_board_id
  })
}
