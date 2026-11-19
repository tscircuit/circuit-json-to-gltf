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
  // Counterclockwise seen from outside: bottom-left, bottom-right, top-right,
  // top-left of the artwork.
  const ring = (z: number) => [
    point(-w, -h, z),
    point(w, -h, z),
    point(w, h, z),
    point(-w, h, z),
  ]
  const back = ring(0)
  const face = ring(thickness)
  // glTF texture coordinates: (0, 0) is the image's top-left corner.
  const uv = [
    { u: 0, v: 1 },
    { u: 1, v: 1 },
    { u: 1, v: 0 },
    { u: 0, v: 0 },
  ]
  const inward = { x: -normal.x, y: -normal.y, z: -normal.z }
  const triangles: Triangle[] = [
    {
      vertices: [face[0]!, face[1]!, face[2]!],
      uvs: [uv[0]!, uv[1]!, uv[2]!],
      normal,
      pcbFace: "top",
    },
    {
      vertices: [face[0]!, face[2]!, face[3]!],
      uvs: [uv[0]!, uv[2]!, uv[3]!],
      normal,
      pcbFace: "top",
    },
    {
      vertices: [back[0]!, back[2]!, back[1]!],
      normal: inward,
      pcbFace: "side",
    },
    {
      vertices: [back[0]!, back[3]!, back[2]!],
      normal: inward,
      pcbFace: "side",
    },
  ]
  for (let i = 0; i < 4; i++) {
    const j = (i + 1) % 4
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
