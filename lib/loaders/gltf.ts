import {
  Document,
  NodeIO,
  Mesh,
  Primitive,
  Accessor,
} from "@gltf-transform/core"
import { dedup, prune, weld } from "@gltf-transform/functions"
import type {
  STLMesh,
  Triangle,
  Point3,
  CoordinateTransformConfig,
} from "../types"
import {
  transformTriangles,
  COORDINATE_TRANSFORMS,
} from "../utils/coordinate-transform"

const gltfCache = new Map<string, STLMesh>()

export async function loadGLTF(
  url: string,
  transform?: CoordinateTransformConfig,
): Promise<STLMesh> {
  const cacheKey = `${url}:${JSON.stringify(transform ?? {})}`
  if (gltfCache.has(cacheKey)) {
    return gltfCache.get(cacheKey)!
  }

  try {
    const response = await fetch(url)
    const arrayBuffer = await response.arrayBuffer()

    // Create NodeIO instance for loading GLTF
    const io = new NodeIO()
    const document = await io.readBinary(new Uint8Array(arrayBuffer))

    // Optimize the document
    await document.transform(dedup(), prune(), weld())

    // Extract triangles from the document
    const mesh = extractTrianglesFromGLTFDocument(document, transform)

    // Cache the final mesh result
    gltfCache.set(cacheKey, mesh)

    return mesh
  } catch (error) {
    throw new Error(`Failed to load GLTF from ${url}: ${error}`)
  }
}

function extractTrianglesFromGLTFDocument(
  document: Document,
  transform?: CoordinateTransformConfig,
): STLMesh {
  const triangles: Triangle[] = []

  // Traverse all meshes in the document
  const meshes = document.getRoot().listMeshes()

  for (const mesh of meshes) {
    for (const primitive of mesh.listPrimitives()) {
      const positionAccessor = primitive.getAttribute("POSITION")
      const normalAccessor = primitive.getAttribute("NORMAL")
      const indicesAccessor = primitive.getIndices()

      if (!positionAccessor) continue

      const positions = extractFloatArrayFromAccessor(positionAccessor)
      const normals = normalAccessor
        ? extractFloatArrayFromAccessor(normalAccessor)
        : null
      const indices = indicesAccessor
        ? extractIndicesFromAccessor(indicesAccessor)
        : null

      if (!indices) {
        // If no indices, assume triangles are in order (every 3 vertices)
        for (let i = 0; i + 8 < positions.length; i += 9) {
          const px0 = positions[i] ?? 0
          const py0 = positions[i + 1] ?? 0
          const pz0 = positions[i + 2] ?? 0
          const px1 = positions[i + 3] ?? 0
          const py1 = positions[i + 4] ?? 0
          const pz1 = positions[i + 5] ?? 0
          const px2 = positions[i + 6] ?? 0
          const py2 = positions[i + 7] ?? 0
          const pz2 = positions[i + 8] ?? 0

          const triangle: Triangle = {
            vertices: [
              { x: px0, y: py0, z: pz0 },
              { x: px1, y: py1, z: pz1 },
              { x: px2, y: py2, z: pz2 },
            ],
            normal: { x: 0, y: 1, z: 0 }, // Simplified normal
          }
          triangles.push(triangle)
        }
      } else {
        // Use indices to extract triangles
        for (let i = 0; i + 2 < indices.length; i += 3) {
          const idx0 = indices[i] ?? 0
          const idx1 = indices[i + 1] ?? 0
          const idx2 = indices[i + 2] ?? 0

          const i0 = idx0 * 3
          const i1 = idx1 * 3
          const i2 = idx2 * 3

          if (
            i0 + 2 >= positions.length ||
            i1 + 2 >= positions.length ||
            i2 + 2 >= positions.length
          ) {
            continue // Skip invalid indices
          }

          const px0 = positions[i0] ?? 0
          const py0 = positions[i0 + 1] ?? 0
          const pz0 = positions[i0 + 2] ?? 0
          const px1 = positions[i1] ?? 0
          const py1 = positions[i1 + 1] ?? 0
          const pz1 = positions[i1 + 2] ?? 0
          const px2 = positions[i2] ?? 0
          const py2 = positions[i2 + 1] ?? 0
          const pz2 = positions[i2 + 2] ?? 0

          const triangle: Triangle = {
            vertices: [
              { x: px0, y: py0, z: pz0 },
              { x: px1, y: py1, z: pz1 },
              { x: px2, y: py2, z: pz2 },
            ],
            normal:
              normals &&
              i0 + 2 < normals.length &&
              i1 + 2 < normals.length &&
              i2 + 2 < normals.length
                ? {
                    x: (normals[i0]! + normals[i1]! + normals[i2]!) / 3,
                    y:
                      (normals[i0 + 1]! + normals[i1 + 1]! + normals[i2 + 1]!) /
                      3,
                    z:
                      (normals[i0 + 2]! + normals[i1 + 2]! + normals[i2 + 2]!) /
                      3,
                  }
                : { x: 0, y: 1, z: 0 },
          }
          triangles.push(triangle)
        }
      }
    }
  }

  // Apply coordinate transformation if specified
  const finalTransform = transform ?? COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP
  const transformedTriangles =
    finalTransform === COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP
      ? triangles
      : transformTriangles(triangles, finalTransform)

  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox(transformedTriangles),
  }
}

function extractFloatArrayFromAccessor(accessor: Accessor): number[] {
  const array = accessor.getArray()
  const result: number[] = []

  if (array instanceof Float32Array) {
    for (let i = 0; i < array.length; i++) {
      const val = array[i]
      if (typeof val === "number" && !Number.isNaN(val)) {
        result.push(val)
      }
    }
  }

  return result
}

function extractIndicesFromAccessor(accessor: Accessor): number[] {
  const array = accessor.getArray()
  const result: number[] = []

  if (array instanceof Uint16Array || array instanceof Uint32Array) {
    for (let i = 0; i < array.length; i++) {
      const val = array[i]
      if (typeof val === "number" && !Number.isNaN(val)) {
        result.push(val)
      }
    }
  }

  return result
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

export function clearGLTFCache() {
  gltfCache.clear()
}
