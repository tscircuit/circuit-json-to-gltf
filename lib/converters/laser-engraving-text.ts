import { glyphAdvanceRatio, textMetrics } from "@tscircuit/alphabet"
import { glyphOutlineAlphabet } from "@tscircuit/alphabet/outline-polygons"
import earcut from "earcut"
import type {
  Box3D,
  CadLaserEngravingTextRecord,
  Point3,
  Triangle,
} from "../types"
import { boundsOfTriangles } from "../utils/bounding-box"
import {
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "../utils/coordinate-transform"
import { signedArea, type Vec2Point } from "../utils/geometry-loops"
import { getBoundingBoxSize } from "../utils/mesh-scale"

/** How far the mark floats above the engraved surface, in mm, so it does not
 * z-fight with the part. Far below anything a laser resolves. */
const SURFACE_LIFT_MM = 0.02
const FALLBACK_MARK_COLOR = "#2b2b2b"

/** Flat text geometry in the engraving's own frame, in mm: +X along the
 * reading direction, +Y up the text. Rings are counterclockwise for filled
 * areas and clockwise for holes, as the alphabet supplies them. */
function layoutGlyphRings(text: string, fontSize: number): Vec2Point[][][] {
  const glyphs: Vec2Point[][][] = []
  let cursor = 0
  for (const character of text) {
    const rings = glyphOutlineAlphabet[character]
    if (rings) {
      glyphs.push(
        rings.map((ring) =>
          ring.map((p) => ({
            x: cursor + p.x * fontSize,
            y: p.y * fontSize,
          })),
        ),
      )
    }
    cursor +=
      (glyphAdvanceRatio[character] ?? textMetrics.spaceWidthRatio) * fontSize
  }
  return glyphs
}

const isInside = (point: Vec2Point, ring: Vec2Point[]) => {
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const a = ring[i]!
    const b = ring[j]!
    if (
      a.y > point.y !== b.y > point.y &&
      point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x
    )
      inside = !inside
  }
  return inside
}

/** Counterclockwise triangles covering one glyph's filled area. */
function triangulateGlyph(rings: Vec2Point[][]): Vec2Point[][] {
  const outers = rings.filter((ring) => signedArea(ring) > 0)
  const holes = rings.filter((ring) => signedArea(ring) < 0)
  const triangles: Vec2Point[][] = []
  for (const outer of outers) {
    const loops = [outer, ...holes.filter((hole) => isInside(hole[0]!, outer))]
    const points = loops.flat()
    const holeStarts: number[] = []
    let offset = outer.length
    for (const hole of loops.slice(1)) {
      holeStarts.push(offset)
      offset += hole.length
    }
    const indices = earcut(
      points.flatMap((p) => [p.x, p.y]),
      holeStarts,
      2,
    )
    for (let i = 0; i < indices.length; i += 3) {
      const a = points[indices[i]!]!
      let b = points[indices[i + 1]!]!
      let c = points[indices[i + 2]!]!
      if ((b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x) < 0)
        [b, c] = [c, b]
      triangles.push([a, b, c])
    }
  }
  return triangles
}

const parseHex = (color: string): [number, number, number] | undefined => {
  const match = /^#([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(color.trim())
  if (!match) return undefined
  const hex = match[1]!
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)) as [
    number,
    number,
    number,
  ]
}

/** Without a stated color, a mark is drawn to contrast with its
 * part: pale on a dark part, dark on a pale one. */
export function deriveEngravedColor(partColor?: string): string {
  const rgb = partColor ? parseHex(partColor) : undefined
  if (!rgb) return FALLBACK_MARK_COLOR
  const luminance = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255
  const [target, amount] = luminance < 0.4 ? [255, 0.65] : [0, 0.6]
  return `#${rgb
    .map((channel) =>
      Math.round(channel + (target - channel) * amount)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`
}

/** Engraved text as flat filled glyphs on the part surface.
 *
 * The record's frame is right-handed circuit world (+X right, +Y top, +Z up,
 * mm): anchor_position is a point, normal_direction and x_axis_direction are
 * unit directions, and the text's up direction is normal_direction cross
 * x_axis_direction. Geometry is built in that
 * frame and crosses to Scene3D (+Y up) through the same
 * CIRCUIT_Z_UP_TO_SCENE_Y_UP transform createReferenceSurfaceBox uses for its
 * plane; glTF export applies its canonical X mirror alongside all CAD meshes.
 *
 * anchor_alignment refers to the extents of the engraved strokes. Depth is not
 * modeled: the mark is drawn flat on the surface. Engraving depth is on the
 * source record and is not read here.
 */
export function createLaserEngravingTextBox(
  engraving: CadLaserEngravingTextRecord,
  options: { partColor?: string; ownerName?: string } = {},
): Box3D | undefined {
  const glyphs = layoutGlyphRings(engraving.text, engraving.font_size)
  const points = glyphs.flat(2)
  if (points.length === 0) return undefined

  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const [minX, maxX] = [Math.min(...xs), Math.max(...xs)]
  const [minY, maxY] = [Math.min(...ys), Math.max(...ys)]
  const alignment = engraving.anchor_alignment ?? "center"
  const anchorX = alignment.endsWith("left")
    ? minX
    : alignment.endsWith("right")
      ? maxX
      : (minX + maxX) / 2
  const anchorY = alignment.startsWith("top")
    ? maxY
    : alignment.startsWith("bottom")
      ? minY
      : (minY + maxY) / 2

  const {
    anchor_position: origin,
    normal_direction: normal,
    x_axis_direction: xAxis,
  } = engraving
  // Up the text: normal_direction cross x_axis_direction, completing a
  // right-handed frame.
  const yAxis: Point3 = {
    x: normal.y * xAxis.z - normal.z * xAxis.y,
    y: normal.z * xAxis.x - normal.x * xAxis.z,
    z: normal.x * xAxis.y - normal.y * xAxis.x,
  }
  const toWorld = (p: Vec2Point): Point3 => {
    const u = p.x - anchorX
    const v = p.y - anchorY
    return {
      x: origin.x + xAxis.x * u + yAxis.x * v + normal.x * SURFACE_LIFT_MM,
      y: origin.y + xAxis.y * u + yAxis.y * v + normal.y * SURFACE_LIFT_MM,
      z: origin.z + xAxis.z * u + yAxis.z * v + normal.z * SURFACE_LIFT_MM,
    }
  }

  const circuitTriangles: Triangle[] = glyphs.flatMap((rings) =>
    triangulateGlyph(rings).map(([a, b, c]) => ({
      vertices: [toWorld(a!), toWorld(b!), toWorld(c!)],
      normal: { ...normal },
    })),
  )
  const sceneTriangles = transformTriangles(
    circuitTriangles,
    COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP,
  )

  // Keep the mesh local to its measured center, like createReferenceSurfaceBox,
  // so camera fitting and mesh export use the same world placement.
  const boundingBox = boundsOfTriangles(sceneTriangles)
  const center = {
    x: (boundingBox.min.x + boundingBox.max.x) / 2,
    y: (boundingBox.min.y + boundingBox.max.y) / 2,
    z: (boundingBox.min.z + boundingBox.max.z) / 2,
  }
  for (const triangle of sceneTriangles) {
    triangle.vertices = triangle.vertices.map((vertex) => ({
      x: vertex.x - center.x,
      y: vertex.y - center.y,
      z: vertex.z - center.z,
    })) as Triangle["vertices"]
  }

  return {
    center,
    size: getBoundingBoxSize(boundingBox),
    label: `${options.ownerName ?? "part"} engraving "${engraving.text}"`,
    color: engraving.color ?? deriveEngravedColor(options.partColor),
    mesh: {
      triangles: sceneTriangles,
      boundingBox: boundsOfTriangles(sceneTriangles),
    },
  }
}
