import type { PcbPlatedHole, PcbHole } from "circuit-json"
import {
  createCircleLoop,
  createRoundedRectLoop,
  isValidLoop,
  normalizeLoop,
  rotateLoop,
  translateLoop,
  type Vec2Point,
} from "./geometry-loops"

const getNumberProperty = (
  obj: Record<string, unknown>,
  key: string,
): number | undefined => {
  const value = obj[key]
  return typeof value === "number" ? value : undefined
}

export const createHoleLoops = ({
  boardCenter,
  holes,
  platedHoles,
  segments,
}: {
  boardCenter: { x: number; y: number }
  holes: PcbHole[]
  platedHoles: PcbPlatedHole[]
  segments: number
}): Vec2Point[][] => {
  const loops: Vec2Point[][] = []

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

      let loop = createRoundedRectLoop({ width, height, segments })
      if (rotate) {
        loop = rotateLoop({ loop, angle: Math.PI / 2 })
      }
      loops.push(translateLoop({ loop, offset: { x: relX, y: relY } }))
      continue
    }

    if (holeShape === "rotated_pill") {
      const holeWidth = getNumberProperty(holeRecord, "hole_width")
      const holeHeight = getNumberProperty(holeRecord, "hole_height")
      if (!holeWidth || !holeHeight) continue

      const rotation = getNumberProperty(holeRecord, "ccw_rotation") ?? 0
      const rotationRad = -(rotation * Math.PI) / 180
      let loop = createRoundedRectLoop({
        width: holeWidth,
        height: holeHeight,
        segments,
      })
      if (rotationRad !== 0) {
        loop = rotateLoop({ loop, angle: rotationRad })
      }
      loops.push(translateLoop({ loop, offset: { x: relX, y: relY } }))
      continue
    }

    const diameter =
      getNumberProperty(holeRecord, "hole_diameter") ??
      getNumberProperty(holeRecord, "diameter")
    if (!diameter) continue

    loops.push(
      createCircleLoop({
        center: { x: relX, y: relY },
        radius: diameter / 2,
        segments,
      }),
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
      let loop = createRoundedRectLoop({
        width: holeWidth,
        height: holeHeight,
        segments,
      })
      if (rotationRad !== 0) {
        loop = rotateLoop({ loop, angle: rotationRad })
      }
      loops.push(translateLoop({ loop, offset: { x: relX, y: relY } }))
      continue
    }

    const diameter =
      getNumberProperty(platedRecord, "hole_diameter") ??
      getNumberProperty(platedRecord, "outer_diameter")
    if (!diameter) continue

    loops.push(
      createCircleLoop({
        center: { x: relX, y: relY },
        radius: diameter / 2,
        segments,
      }),
    )
  }

  return loops.map(normalizeLoop).filter(isValidLoop)
}
