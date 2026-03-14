export interface Vec2Point {
  x: number
  y: number
}

const POINT_EPSILON = 1e-8
const RADIUS_EPSILON = 1e-4

export const signedArea = (loop: Vec2Point[]): number => {
  let area = 0
  for (let i = 0; i < loop.length; i++) {
    const a = loop[i]!
    const b = loop[(i + 1) % loop.length]!
    area += a.x * b.y - b.x * a.y
  }
  return area / 2
}

export const removeDuplicateAdjacentPoints = (
  points: Vec2Point[],
): Vec2Point[] => {
  if (points.length === 0) return points

  const filtered: Vec2Point[] = [points[0]!]
  for (let i = 1; i < points.length; i++) {
    const prev = filtered[filtered.length - 1]!
    const curr = points[i]!
    if (Math.hypot(curr.x - prev.x, curr.y - prev.y) > POINT_EPSILON) {
      filtered.push(curr)
    }
  }

  if (filtered.length > 2) {
    const first = filtered[0]!
    const last = filtered[filtered.length - 1]!
    if (Math.hypot(first.x - last.x, first.y - last.y) <= POINT_EPSILON) {
      filtered.pop()
    }
  }

  return filtered
}

export const normalizeLoop = (loop: Vec2Point[]): Vec2Point[] =>
  removeDuplicateAdjacentPoints(loop)

export const isValidLoop = (loop: Vec2Point[]): boolean =>
  loop.length >= 3 && Math.abs(signedArea(loop)) > 1e-10

export const rotateLoop = ({
  loop,
  angle,
}: {
  loop: Vec2Point[]
  angle: number
}): Vec2Point[] => {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return loop.map((p) => ({
    x: p.x * cos - p.y * sin,
    y: p.x * sin + p.y * cos,
  }))
}

export const translateLoop = ({
  loop,
  offset,
}: {
  loop: Vec2Point[]
  offset: Vec2Point
}): Vec2Point[] => loop.map((p) => ({ x: p.x + offset.x, y: p.y + offset.y }))

export const createCircleLoop = ({
  center,
  radius,
  segments,
}: {
  center: Vec2Point
  radius: number
  segments: number
}): Vec2Point[] => {
  const points: Vec2Point[] = []
  const count = Math.max(8, segments)
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2
    points.push({
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    })
  }
  return points
}

export const createRoundedRectLoop = ({
  width,
  height,
  segments,
}: {
  width: number
  height: number
  segments: number
}): Vec2Point[] => {
  const minDimension = Math.min(width, height)
  const maxAllowedRadius = Math.max(0, minDimension / 2 - RADIUS_EPSILON)
  const radius =
    maxAllowedRadius <= 0 ? 0 : Math.min(height / 2, maxAllowedRadius)

  if (radius <= POINT_EPSILON) {
    return [
      { x: -width / 2, y: -height / 2 },
      { x: width / 2, y: -height / 2 },
      { x: width / 2, y: height / 2 },
      { x: -width / 2, y: height / 2 },
    ]
  }

  const points: Vec2Point[] = []
  const cornerSteps = Math.max(3, Math.floor(segments / 4))
  const left = -width / 2
  const right = width / 2
  const bottom = -height / 2
  const top = height / 2

  const corners = [
    {
      cx: right - radius,
      cy: bottom + radius,
      start: -Math.PI / 2,
      end: 0,
    },
    { cx: right - radius, cy: top - radius, start: 0, end: Math.PI / 2 },
    {
      cx: left + radius,
      cy: top - radius,
      start: Math.PI / 2,
      end: Math.PI,
    },
    {
      cx: left + radius,
      cy: bottom + radius,
      start: Math.PI,
      end: (Math.PI * 3) / 2,
    },
  ]

  for (let c = 0; c < corners.length; c++) {
    const corner = corners[c]!
    for (let i = 0; i < cornerSteps; i++) {
      if (c > 0 && i === 0) continue
      const t = i / (cornerSteps - 1)
      const angle = corner.start + (corner.end - corner.start) * t
      points.push({
        x: corner.cx + Math.cos(angle) * radius,
        y: corner.cy + Math.sin(angle) * radius,
      })
    }
  }

  return removeDuplicateAdjacentPoints(points)
}
