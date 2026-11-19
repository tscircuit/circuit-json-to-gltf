import type { Asset } from "circuit-json"
import { fetchWithTimeout } from "../loaders/fetch-with-timeout"
import { resolveModelUrl } from "../loaders/resolve-model-url"
import type { AuthHeaders, Box3D, Point3, Triangle } from "../types"
import { boundsOfTriangles } from "../utils/bounding-box"
import {
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "../utils/coordinate-transform"
import { getBoundingBoxSize } from "../utils/mesh-scale"

/** Draft of the proposed Circuit JSON `cad_sticker` record, not yet in the
 * installed circuit-json package. Right-handed circuit world, mm: +X right,
 * +Y top, +Z above. `center` is a point on the surface the sticker is applied
 * to; `normal_direction` and `x_axis_direction` are perpendicular unit
 * directions. Seen from outside, looking against `normal_direction`, the
 * artwork reads left to right along `x_axis_direction` with its top toward
 * `normal_direction × x_axis_direction`.
 */
export interface CadStickerRecord {
  type: "cad_sticker"
  cad_sticker_id: string
  source_component_id: string
  applied_to_source_component_id?: string
  center: Point3
  normal_direction: Point3
  x_axis_direction: Point3
  width: number
  height: number
  corner_radius?: number
  thickness?: number
  image_asset?: Asset
  background_color?: string
  subcircuit_id?: string
}

/** Rendered when the record leaves thickness unspecified, in mm. */
const DEFAULT_RENDER_THICKNESS = 0.1
const DEFAULT_BACKGROUND_COLOR = "#ffffff"

const cross = (a: Point3, b: Point3): Point3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
})

/** Segments used to approximate each rounded corner's quarter circle. */
const CORNER_SEGMENTS = 8

/** The sticker's outline in its own XY, in mm: X along x_axis_direction, Y
 * toward the artwork's top, origin at the center. Counterclockwise seen from
 * outside, starting at the bottom-left. `halfWidth` and `halfHeight` are half
 * extents; the radius is clamped to the smaller of them.
 */
function stickerOutline(
  halfWidth: number,
  halfHeight: number,
  cornerRadius: number,
): Array<{ x: number; y: number }> {
  const radius = Math.min(cornerRadius, halfWidth, halfHeight)
  if (!(radius > 0))
    return [
      { x: -halfWidth, y: -halfHeight },
      { x: halfWidth, y: -halfHeight },
      { x: halfWidth, y: halfHeight },
      { x: -halfWidth, y: halfHeight },
    ]
  // Each corner's arc center and the angle its arc starts at, in quarter turns.
  const corners = [
    { x: -halfWidth + radius, y: -halfHeight + radius, startQuarter: 2 },
    { x: halfWidth - radius, y: -halfHeight + radius, startQuarter: 3 },
    { x: halfWidth - radius, y: halfHeight - radius, startQuarter: 0 },
    { x: -halfWidth + radius, y: halfHeight - radius, startQuarter: 1 },
  ]
  const outline: Array<{ x: number; y: number }> = []
  for (const corner of corners) {
    for (let step = 0; step <= CORNER_SEGMENTS; step++) {
      const angle =
        ((corner.startQuarter + step / CORNER_SEGMENTS) * Math.PI) / 2
      outline.push({
        x: corner.x + radius * Math.cos(angle),
        y: corner.y + radius * Math.sin(angle),
      })
    }
  }
  // A radius of half a side makes neighbouring arcs meet, which would leave
  // zero-length edges.
  return outline.filter((vertex, index) => {
    const next = outline[(index + 1) % outline.length]!
    return Math.hypot(next.x - vertex.x, next.y - vertex.y) > 1e-9
  })
}

/** A thin slab with the artwork on its outward face. Corners are built in
 * circuit world from the record's frame, the same way
 * createReferenceSurfaceBox builds its rectangle, then cross the
 * circuit -> Scene3D (+Y up) boundary through CIRCUIT_Z_UP_TO_SCENE_Y_UP.
 * glTF export applies its canonical X mirror to this mesh with every other.
 */
export async function createStickerBox(
  sticker: CadStickerRecord,
  options: {
    label?: string
    textureResolution?: number
    projectBaseUrl?: string
    authHeaders?: AuthHeaders
  } = {},
): Promise<Box3D> {
  const {
    center,
    normal_direction: normal,
    x_axis_direction: xAxis,
    width,
    height,
  } = sticker
  const thickness = sticker.thickness ?? DEFAULT_RENDER_THICKNESS
  const backgroundColor = sticker.background_color ?? DEFAULT_BACKGROUND_COLOR
  const yAxis = cross(normal, xAxis)
  const point = (x: number, y: number, z: number): Point3 => ({
    x: center.x + xAxis.x * x + yAxis.x * y + normal.x * z,
    y: center.y + xAxis.y * x + yAxis.y * y + normal.y * z,
    z: center.z + xAxis.z * x + yAxis.z * y + normal.z * z,
  })
  const [w, h] = [width / 2, height / 2]
  const outline = stickerOutline(w, h, sticker.corner_radius ?? 0)
  const back = outline.map(({ x, y }) => point(x, y, 0))
  const face = outline.map(({ x, y }) => point(x, y, thickness))
  // glTF texture coordinates: (0, 0) is the image's top-left corner.
  const uvs = outline.map(({ x, y }) => ({
    u: (x + w) / width,
    v: (h - y) / height,
  }))
  const inward = { x: -normal.x, y: -normal.y, z: -normal.z }
  const triangles: Triangle[] = []
  // The outline is convex, so both faces are fans around the sticker's center.
  const faceCenter = point(0, 0, thickness)
  const backCenter = point(0, 0, 0)
  for (let i = 0; i < outline.length; i++) {
    const j = (i + 1) % outline.length
    const edge = {
      x: back[j]!.x - back[i]!.x,
      y: back[j]!.y - back[i]!.y,
      z: back[j]!.z - back[i]!.z,
    }
    const length = Math.hypot(edge.x, edge.y, edge.z)
    const outward = cross(edge, normal)
    const sideNormal = {
      x: outward.x / length,
      y: outward.y / length,
      z: outward.z / length,
    }
    triangles.push(
      {
        vertices: [faceCenter, face[i]!, face[j]!],
        uvs: [{ u: 0.5, v: 0.5 }, uvs[i]!, uvs[j]!],
        normal,
        pcbFace: "top",
      },
      {
        vertices: [backCenter, back[j]!, back[i]!],
        normal: inward,
        pcbFace: "side",
      },
      {
        vertices: [back[i]!, back[j]!, face[j]!],
        normal: sideNormal,
        pcbFace: "side",
      },
      {
        vertices: [back[i]!, face[j]!, face[i]!],
        normal: sideNormal,
        pcbFace: "side",
      },
    )
  }

  const sceneTriangles = transformTriangles(
    triangles,
    COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP,
  )
  const boundingBox = boundsOfTriangles(sceneTriangles)
  // Keep the mesh local to its measured center, like createReferenceSurfaceBox,
  // so camera fitting and mesh export use the same world placement.
  const meshCenter = {
    x: (boundingBox.min.x + boundingBox.max.x) / 2,
    y: (boundingBox.min.y + boundingBox.max.y) / 2,
    z: (boundingBox.min.z + boundingBox.max.z) / 2,
  }
  for (const triangle of sceneTriangles) {
    triangle.vertices = triangle.vertices.map((vertex) => ({
      x: vertex.x - meshCenter.x,
      y: vertex.y - meshCenter.y,
      z: vertex.z - meshCenter.z,
    })) as Triangle["vertices"]
  }

  const texture = await loadStickerTexture(sticker, {
    backgroundColor,
    resolution: options.textureResolution ?? 1024,
    projectBaseUrl: options.projectBaseUrl,
    authHeaders: options.authHeaders,
  })
  return {
    center: meshCenter,
    size: getBoundingBoxSize(boundingBox),
    label: options.label ?? sticker.cad_sticker_id,
    componentMetadata: {
      source_component_id: sticker.source_component_id,
      componentName: options.label,
    },
    mesh: {
      triangles: sceneTriangles,
      boundingBox: boundsOfTriangles(sceneTriangles),
    },
    texture: { top: texture },
    sideColor: backgroundColor,
  }
}

/** Returns a PNG or JPEG data URL for the sticker's printed face. SVG artwork
 * is rasterized over the background color. An unprinted sticker, or artwork
 * that fails to load, renders as the plain background color.
 */
async function loadStickerTexture(
  sticker: CadStickerRecord,
  options: {
    backgroundColor: string
    resolution: number
    projectBaseUrl?: string
    authHeaders?: AuthHeaders
  },
): Promise<string> {
  const { width, height } = sticker
  const blank = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><rect width="${width}" height="${height}" fill="${options.backgroundColor}"/></svg>`
  // The longer side gets the full resolution.
  const pixelWidth = Math.max(
    1,
    Math.round(options.resolution * Math.min(1, width / height)),
  )
  const rasterize = (svg: string) =>
    svgToPngDataUrl(svg, {
      width: pixelWidth,
      background: options.backgroundColor,
    })
  const artwork = sticker.image_asset
  if (!artwork) return rasterize(blank)
  try {
    const url = await resolveModelUrl(artwork.url, options.projectBaseUrl)
    const response = await fetchWithTimeout(url, {
      authHeaders: options.authHeaders,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const bytes = new Uint8Array(await response.arrayBuffer())
    // The asset's mimetype, not the URL or response, says how to read it.
    if (artwork.mimetype === "image/svg+xml")
      return await rasterize(new TextDecoder().decode(bytes))
    let binary = ""
    for (const byte of bytes) binary += String.fromCharCode(byte)
    return `data:${artwork.mimetype};base64,${btoa(binary)}`
  } catch (error) {
    console.warn(
      `Failed to load artwork for sticker ${sticker.cad_sticker_id}:`,
      error,
    )
    return rasterize(blank)
  }
}

/** Matches board-renderer's platform dispatch for SVG rasterization. */
async function svgToPngDataUrl(
  svg: string,
  options: { width: number; background: string },
): Promise<string> {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const browser = await import("../utils/svg-to-png-browser")
    return browser.svgToPngDataUrl(svg, options)
  }
  const native = await import("../utils/svg-to-png")
  return native.svgToPngDataUrl(svg, options)
}
