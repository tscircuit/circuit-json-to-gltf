import type { Point } from "circuit-json"
import {
  createCircleLoop,
  isValidLoop,
  normalizeLoop,
  rotateLoop,
  translateLoop,
  type Vec2Point,
} from "./geometry-loops"
import type { BoardCutout } from "./pcb-board-cutouts"
import { getCutoutRotationRadians, isFiniteNumber } from "./pcb-board-cutouts"

export const createCutoutLoops = ({
  boardCenter,
  cutouts,
  segments,
}: {
  boardCenter: { x: number; y: number }
  cutouts: BoardCutout[]
  segments: number
}): Vec2Point[][] => {
  const loops: Vec2Point[][] = []

  for (const cutout of cutouts) {
    if (!cutout) continue

    switch (cutout.shape) {
      case "rect": {
        const { center } = cutout
        if (!center || !isFiniteNumber(center.x) || !isFiniteNumber(center.y)) {
          continue
        }

        const width = isFiniteNumber(cutout.width) ? cutout.width : undefined
        const height = isFiniteNumber(cutout.height) ? cutout.height : undefined
        if (!width || !height) continue

        let loop: Vec2Point[] = [
          { x: -width / 2, y: -height / 2 },
          { x: width / 2, y: -height / 2 },
          { x: width / 2, y: height / 2 },
          { x: -width / 2, y: height / 2 },
        ]

        const rotationRad = getCutoutRotationRadians(cutout.rotation)
        if (rotationRad !== 0) {
          loop = rotateLoop({ loop, angle: -rotationRad })
        }

        const relX = center.x - boardCenter.x
        const relY = -(center.y - boardCenter.y)
        loops.push(translateLoop({ loop, offset: { x: relX, y: relY } }))
        break
      }
      case "circle": {
        const { center } = cutout
        if (!center || !isFiniteNumber(center.x) || !isFiniteNumber(center.y)) {
          continue
        }

        const radius = isFiniteNumber(cutout.radius)
          ? cutout.radius
          : getRadiusFromDiameter(cutout)
        if (!radius) continue

        const relX = center.x - boardCenter.x
        const relY = -(center.y - boardCenter.y)
        loops.push(
          createCircleLoop({
            center: { x: relX, y: relY },
            radius,
            segments,
          }),
        )
        break
      }
      case "polygon": {
        if (!Array.isArray(cutout.points) || cutout.points.length < 3) continue

        const polygonPoints = cutout.points
          .filter(
            (point): point is Point =>
              point !== undefined &&
              isFiniteNumber(point.x) &&
              isFiniteNumber(point.y),
          )
          .map((point) => ({
            x: point.x - boardCenter.x,
            y: -(point.y - boardCenter.y),
          }))

        if (polygonPoints.length >= 3) {
          loops.push(polygonPoints)
        }
        break
      }
      default:
        break
    }
  }

  return loops.map(normalizeLoop).filter(isValidLoop)
}

const getRadiusFromDiameter = (cutout: BoardCutout): number | undefined => {
  if (
    "diameter" in cutout &&
    typeof cutout.diameter === "number" &&
    Number.isFinite(cutout.diameter)
  ) {
    return cutout.diameter / 2
  }

  return undefined
}
