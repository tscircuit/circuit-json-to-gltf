import type {
  AuthHeaders,
  CoordinateTransformConfig,
  Point3,
  STLMesh,
  Triangle,
} from "../types"
import { boundsOfTriangles } from "../utils/bounding-box"
import {
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "../utils/coordinate-transform"
import { fetchWithTimeout } from "./fetch-with-timeout"
import { resolveModelUrl } from "./resolve-model-url"

const stlCache = new Map<string, STLMesh>()

export async function loadSTL({
  url,
  transform,
  projectBaseUrl,
  authHeaders,
}: {
  url: string
  transform?: CoordinateTransformConfig
  projectBaseUrl?: string
  authHeaders?: AuthHeaders
}): Promise<STLMesh> {
  const resolvedUrl = await resolveModelUrl(url, projectBaseUrl)
  const cacheKey = `${resolvedUrl}:${JSON.stringify(transform ?? {})}`
  if (stlCache.has(cacheKey)) {
    return stlCache.get(cacheKey)!
  }

  const response = await fetchWithTimeout(resolvedUrl, { authHeaders })
  const buffer = await response.arrayBuffer()
  const mesh = parseSTL(buffer, transform)
  stlCache.set(cacheKey, mesh)
  return mesh
}

function isLikelyASCIISTL(buffer: ArrayBuffer, view: DataView): boolean {
  if (buffer.byteLength >= 84) {
    const expectedBinaryByteLength = 84 + view.getUint32(80, true) * 50
    if (expectedBinaryByteLength === buffer.byteLength) {
      return false
    }
  }
  const probe = new TextDecoder()
    .decode(buffer.slice(0, Math.min(buffer.byteLength, 512)))
    .trimStart()
  return (
    probe.toLowerCase().startsWith("solid") && /facet\s+normal/i.test(probe)
  )
}

function parseSTL(
  buffer: ArrayBuffer,
  transform?: CoordinateTransformConfig,
): STLMesh {
  const view = new DataView(buffer)

  if (isLikelyASCIISTL(buffer, view)) {
    return parseASCIISTL(buffer, transform)
  }
  return parseBinarySTL(view, transform)
}

function parseASCIISTL(
  buffer: ArrayBuffer,
  transform?: CoordinateTransformConfig,
): STLMesh {
  const text = new TextDecoder().decode(buffer)
  const lines = text.split("\n").map((line) => line.trim())

  const triangles: Triangle[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line && line.startsWith("facet normal")) {
      const normalMatch = line.match(
        /facet normal\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/,
      )
      const normal: Point3 = normalMatch
        ? {
            x: parseFloat(normalMatch[1]!),
            y: parseFloat(normalMatch[2]!),
            z: parseFloat(normalMatch[3]!),
          }
        : { x: 0, y: 0, z: 1 }

      i++ // skip to outer loop
      const vertices: Point3[] = []

      while (
        i < lines.length &&
        lines[i] &&
        !lines[i]!.startsWith("endfacet")
      ) {
        const vertexLine = lines[i]!
        if (vertexLine.startsWith("vertex")) {
          const vertexMatch = vertexLine.match(
            /vertex\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)\s+([-+]?\d*\.?\d+(?:[eE][-+]?\d+)?)/,
          )
          if (vertexMatch) {
            vertices.push({
              x: parseFloat(vertexMatch[1]!),
              y: parseFloat(vertexMatch[2]!),
              z: parseFloat(vertexMatch[3]!),
            })
          }
        }
        i++
      }

      if (vertices.length === 3) {
        triangles.push({
          vertices: [vertices[0]!, vertices[1]!, vertices[2]!],
          normal,
        })
      }
    }
    i++
  }

  // Apply coordinate transformation
  const finalConfig = transform ?? COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP
  const transformedTriangles = transformTriangles(triangles, finalConfig)

  return {
    triangles: transformedTriangles,
    boundingBox: boundsOfTriangles(transformedTriangles),
  }
}

function parseBinarySTL(
  view: DataView,
  transform?: CoordinateTransformConfig,
): STLMesh {
  // Skip 80-byte header
  let offset = 80

  // Read number of triangles (4 bytes, little endian)
  const numTriangles = view.getUint32(offset, true)
  offset += 4

  const triangles: Triangle[] = []

  for (let i = 0; i < numTriangles; i++) {
    // Read normal vector (3 floats, 12 bytes)
    const normal: Point3 = {
      x: view.getFloat32(offset, true),
      y: view.getFloat32(offset + 4, true),
      z: view.getFloat32(offset + 8, true),
    }
    offset += 12

    // Read vertices (3 vertices × 3 floats × 4 bytes = 36 bytes)
    const vertices: [Point3, Point3, Point3] = [
      {
        x: view.getFloat32(offset, true),
        y: view.getFloat32(offset + 4, true),
        z: view.getFloat32(offset + 8, true),
      },
      {
        x: view.getFloat32(offset + 12, true),
        y: view.getFloat32(offset + 16, true),
        z: view.getFloat32(offset + 20, true),
      },
      {
        x: view.getFloat32(offset + 24, true),
        y: view.getFloat32(offset + 28, true),
        z: view.getFloat32(offset + 32, true),
      },
    ]
    offset += 36

    // Skip attribute byte count (2 bytes)
    offset += 2

    if (normal.x === 0 && normal.y === 0 && normal.z === 0) {
      const [v0, v1, v2] = vertices
      const edge1 = { x: v1.x - v0.x, y: v1.y - v0.y, z: v1.z - v0.z }
      const edge2 = { x: v2.x - v0.x, y: v2.y - v0.y, z: v2.z - v0.z }
      const nx = edge1.y * edge2.z - edge1.z * edge2.y
      const ny = edge1.z * edge2.x - edge1.x * edge2.z
      const nz = edge1.x * edge2.y - edge1.y * edge2.x
      const len = Math.hypot(nx, ny, nz)
      if (len > 0) {
        normal.x = nx / len
        normal.y = ny / len
        normal.z = nz / len
      } else {
        normal.z = 1
      }
    }

    triangles.push({ vertices, normal })
  }

  // Apply coordinate transformation
  const finalConfig = transform ?? COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP
  const transformedTriangles = transformTriangles(triangles, finalConfig)

  return {
    triangles: transformedTriangles,
    boundingBox: boundsOfTriangles(transformedTriangles),
  }
}

export function clearSTLCache() {
  stlCache.clear()
}
