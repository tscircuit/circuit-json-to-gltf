import type { Point3, STLMesh, Triangle, CoordinateTransformConfig } from "../types"
import { transformTriangles, COORDINATE_TRANSFORMS } from "../utils/coordinate-transform"

const stlCache = new Map<string, STLMesh>()

export async function loadSTL(
  url: string, 
  transform?: CoordinateTransformConfig
): Promise<STLMesh> {
  const cacheKey = `${url}:${JSON.stringify(transform ?? {})}`
  if (stlCache.has(cacheKey)) {
    return stlCache.get(cacheKey)!
  }

  const response = await fetch(url)
  const buffer = await response.arrayBuffer()
  const mesh = parseSTL(buffer, transform)
  stlCache.set(cacheKey, mesh)
  return mesh
}

function parseSTL(buffer: ArrayBuffer, transform?: CoordinateTransformConfig): STLMesh {
  const view = new DataView(buffer)

  // Check if it's binary STL (first 5 bytes should not be "solid")
  const header = new TextDecoder().decode(buffer.slice(0, 5))

  if (header.toLowerCase() === "solid") {
    return parseASCIISTL(buffer, transform)
  } else {
    return parseBinarySTL(view, transform)
  }
}

function parseASCIISTL(buffer: ArrayBuffer, transform?: CoordinateTransformConfig): STLMesh {
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
    boundingBox: calculateBoundingBox(transformedTriangles),
  }
}

function parseBinarySTL(view: DataView, transform?: CoordinateTransformConfig): STLMesh {
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

    triangles.push({ vertices, normal })
  }

  // Apply coordinate transformation
  const finalConfig = transform ?? COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP
  const transformedTriangles = transformTriangles(triangles, finalConfig)

  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox(transformedTriangles),
  }
}

function calculateBoundingBox(triangles: Triangle[]): {
  min: Point3
  max: Point3
} {
  if (triangles.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    }
  }

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity

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

export function clearSTLCache() {
  stlCache.clear()
}
