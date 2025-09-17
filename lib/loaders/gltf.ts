import type {
  Point3,
  GLTFMesh,
  Triangle,
  CoordinateTransformConfig,
} from "../types"
import {
  transformTriangles,
  COORDINATE_TRANSFORMS,
} from "../utils/coordinate-transform"

const gltfCache = new Map<string, GLTFMesh>()

/**
 * TDD Cycle 1: Base64 Buffer Decoding
 * Decodes a base64 data URI to an ArrayBuffer
 */
export function decodeBase64Buffer(dataUri: string): ArrayBuffer {
  // Input validation
  if (dataUri == null) {
    throw new Error("Data URI cannot be null or undefined")
  }

  if (typeof dataUri !== 'string') {
    throw new Error("Data URI must be a string")
  }

  if (dataUri.length === 0) {
    throw new Error("Invalid base64 data URI")
  }

  // Parse the data URI - require proper media type
  const base64Match = dataUri.match(/^data:[^;]+;base64,(.*)$/)
  if (!base64Match) {
    throw new Error("Invalid base64 data URI")
  }

  const base64String = base64Match[1]!

  // Security: Allow empty base64 (valid case for zero-length buffers)
  if (base64String.length === 0) {
    return new ArrayBuffer(0)
  }

  // Security: Check for valid base64 characters only
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  if (!base64Regex.test(base64String)) {
    throw new Error("Invalid base64 content")
  }

  // Security: Validate base64 padding
  if (base64String.length % 4 !== 0) {
    throw new Error("Invalid base64 content")
  }

  try {
    // Decode base64 to binary string - atob can throw for invalid base64
    const binaryString = atob(base64String)

    // Security: Validate decoded size is reasonable
    if (binaryString.length > 100 * 1024 * 1024) { // 100MB max
      throw new Error("Base64 data too large")
    }

    // Convert binary string to ArrayBuffer
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    return bytes.buffer
  } catch (error) {
    throw new Error(`Invalid base64 content: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function loadGLTF(
  url: string,
  transform?: CoordinateTransformConfig,
): Promise<GLTFMesh> {
  const cacheKey = `${url}:${JSON.stringify(transform ?? {})}`
  if (gltfCache.has(cacheKey)) {
    return gltfCache.get(cacheKey)!
  }

  const response = await fetch(url)
  const gltfJson = await response.json()
  const mesh = await parseGLTF(gltfJson, url, transform)
  gltfCache.set(cacheKey, mesh)
  return mesh
}

async function parseGLTF(
  gltfJson: any,
  baseUrl: string,
  transform?: CoordinateTransformConfig,
): Promise<GLTFMesh> {
  // Load all buffers
  const buffers = await loadBuffers(gltfJson, baseUrl)

  // Extract triangles from all meshes
  const triangles: Triangle[] = []

  if (gltfJson.meshes) {
    for (const mesh of gltfJson.meshes) {
      const meshTriangles = extractMeshData(mesh, gltfJson, buffers)
      triangles.push(...meshTriangles)
    }
  }

  // Apply coordinate transformation (GLTF is Y-up, same as target system)
  const finalConfig = transform ?? COORDINATE_TRANSFORMS.IDENTITY
  const transformedTriangles = transformTriangles(triangles, finalConfig)

  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox(transformedTriangles),
  }
}

async function loadBuffers(gltfJson: any, baseUrl: string): Promise<ArrayBuffer[]> {
  const buffers: ArrayBuffer[] = []

  if (!gltfJson.buffers) return buffers

  for (const buffer of gltfJson.buffers) {
    if (buffer.uri) {
      if (buffer.uri.startsWith('data:')) {
        // Embedded base64 buffer
        const base64Data = buffer.uri.split(',')[1]
        const binaryString = atob(base64Data)
        const arrayBuffer = new ArrayBuffer(binaryString.length)
        const uint8Array = new Uint8Array(arrayBuffer)
        for (let i = 0; i < binaryString.length; i++) {
          uint8Array[i] = binaryString.charCodeAt(i)
        }
        buffers.push(arrayBuffer)
      } else {
        // External buffer file
        const bufferUrl = new URL(buffer.uri, baseUrl).href
        const response = await fetch(bufferUrl)
        const arrayBuffer = await response.arrayBuffer()
        buffers.push(arrayBuffer)
      }
    }
  }

  return buffers
}

function extractMeshData(
  mesh: any,
  gltfJson: any,
  buffers: ArrayBuffer[],
): Triangle[] {
  const triangles: Triangle[] = []

  for (const primitive of mesh.primitives) {
    // Only handle TRIANGLES mode (mode 4 or undefined defaults to triangles)
    if (primitive.mode !== undefined && primitive.mode !== 4) {
      continue
    }

    const attributes = primitive.attributes
    if (attributes.POSITION === undefined) {
      continue
    }

    // Extract position data
    const positions = extractAccessorData(attributes.POSITION, gltfJson, buffers) as Float32Array

    // Extract normal data if available
    let normals: Float32Array | null = null
    if (attributes.NORMAL) {
      const normalData = extractAccessorData(attributes.NORMAL, gltfJson, buffers)
      normals = normalData as Float32Array // Normals are always FLOAT
    }

    // Extract indices if available
    let indices: Uint16Array | Uint32Array | null = null
    if (primitive.indices !== undefined) {
      const indexData = extractAccessorData(primitive.indices, gltfJson, buffers)
      indices = indexData as Uint16Array | Uint32Array // Indices are UNSIGNED_SHORT or UNSIGNED_INT
    }

    // Convert to triangles
    const primitiveTriangles = createTriangles(positions, normals, indices)
    triangles.push(...primitiveTriangles)
  }

  return triangles
}

function extractAccessorData(
  accessorIndex: number,
  gltfJson: any,
  buffers: ArrayBuffer[],
): Float32Array | Uint16Array | Uint32Array {
  const accessor = gltfJson.accessors[accessorIndex]
  const bufferView = gltfJson.bufferViews[accessor.bufferView]
  const buffer = buffers[bufferView.buffer]

  if (!buffer) {
    throw new Error(`Buffer ${bufferView.buffer} not found`)
  }

  // Security: Validate offsets are non-negative
  const accessorOffset = accessor.byteOffset || 0
  const bufferViewOffset = bufferView.byteOffset || 0

  if (accessorOffset < 0) {
    throw new Error(`Accessor byteOffset cannot be negative: ${accessorOffset}`)
  }
  if (bufferViewOffset < 0) {
    throw new Error(`BufferView byteOffset cannot be negative: ${bufferViewOffset}`)
  }

  const byteOffset = accessorOffset + bufferViewOffset
  const componentSize = getComponentSize(accessor.componentType)
  const typeSize = getTypeSize(accessor.type)

  // Security: Validate component type is supported
  if (componentSize === 4 && accessor.componentType !== 5126 && accessor.componentType !== 5125) {
    throw new Error(`Unsupported component type: ${accessor.componentType}`)
  }

  // Security: Validate count is reasonable
  if (accessor.count < 0) {
    throw new Error(`Accessor count cannot be negative: ${accessor.count}`)
  }
  if (accessor.count > 10000000) { // 10M vertices max
    throw new Error(`Accessor count too large: ${accessor.count}`)
  }

  const byteLength = accessor.count * componentSize * typeSize

  // Security: Validate buffer bounds
  if (byteOffset < 0) {
    throw new Error(`Combined byteOffset cannot be negative: ${byteOffset}`)
  }
  if (byteOffset >= buffer.byteLength) {
    throw new Error(`ByteOffset ${byteOffset} exceeds buffer size ${buffer.byteLength}`)
  }
  if (byteOffset + byteLength > buffer.byteLength) {
    throw new Error(`Accessor data extends beyond buffer bounds`)
  }

  try {
    switch (accessor.componentType) {
      case 5126: // FLOAT
        return new Float32Array(buffer, byteOffset, byteLength / 4)
      case 5123: // UNSIGNED_SHORT
        return new Uint16Array(buffer, byteOffset, byteLength / 2)
      case 5125: // UNSIGNED_INT
        return new Uint32Array(buffer, byteOffset, byteLength / 4)
      default:
        throw new Error(`Unsupported component type: ${accessor.componentType}`)
    }
  } catch (error) {
    throw new Error(`Failed to create typed array: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

function getComponentSize(componentType: number): number {
  switch (componentType) {
    case 5120: // BYTE
    case 5121: // UNSIGNED_BYTE
      return 1
    case 5122: // SHORT
    case 5123: // UNSIGNED_SHORT
      return 2
    case 5125: // UNSIGNED_INT
    case 5126: // FLOAT
      return 4
    default:
      return 4
  }
}

function getTypeSize(type: string): number {
  switch (type) {
    case "SCALAR": return 1
    case "VEC2": return 2
    case "VEC3": return 3
    case "VEC4": return 4
    case "MAT2": return 4
    case "MAT3": return 9
    case "MAT4": return 16
    default: return 1
  }
}

export function createTriangles(
  positions: Float32Array,
  normals: Float32Array | null,
  indices: Uint16Array | Uint32Array | null,
): Triangle[] {
  // Input validation
  if (!positions) {
    throw new Error("Positions array cannot be null or undefined")
  }

  if (!(positions instanceof Float32Array)) {
    throw new Error("Positions must be a Float32Array")
  }

  const triangles: Triangle[] = []
  const vertexCount = positions.length / 3

  // Early return for empty or insufficient data
  if (positions.length === 0 || vertexCount < 3) {
    return triangles
  }


  if (indices) {
    // Indexed geometry
    for (let i = 0; i < indices.length; i += 3) {
      // Skip incomplete triangles (not enough indices)
      if (i + 2 >= indices.length) {
        continue
      }

      const i0 = indices[i]!
      const i1 = indices[i + 1]!
      const i2 = indices[i + 2]!

      // Bounds checking for indices
      if (i0 >= vertexCount || i1 >= vertexCount || i2 >= vertexCount) {
        continue // Skip invalid indices
      }

      const v0: Point3 = {
        x: positions[i0 * 3]!,
        y: positions[i0 * 3 + 1]!,
        z: positions[i0 * 3 + 2]!,
      }
      const v1: Point3 = {
        x: positions[i1 * 3]!,
        y: positions[i1 * 3 + 1]!,
        z: positions[i1 * 3 + 2]!,
      }
      const v2: Point3 = {
        x: positions[i2 * 3]!,
        y: positions[i2 * 3 + 1]!,
        z: positions[i2 * 3 + 2]!,
      }

      let normal: Point3
      if (normals) {
        // Use provided normal (average of vertex normals)
        normal = {
          x: (normals[i0 * 3]! + normals[i1 * 3]! + normals[i2 * 3]!) / 3,
          y: (normals[i0 * 3 + 1]! + normals[i1 * 3 + 1]! + normals[i2 * 3 + 1]!) / 3,
          z: (normals[i0 * 3 + 2]! + normals[i1 * 3 + 2]! + normals[i2 * 3 + 2]!) / 3,
        }
      } else {
        // Calculate normal from triangle vertices
        normal = calculateNormal(v0, v1, v2)
      }

      triangles.push({
        vertices: [v0, v1, v2],
        normal,
      })
    }
  } else {
    // Non-indexed geometry
    for (let i = 0; i < vertexCount; i += 3) {
      const v0: Point3 = {
        x: positions[i * 3]!,
        y: positions[i * 3 + 1]!,
        z: positions[i * 3 + 2]!,
      }
      const v1: Point3 = {
        x: positions[(i + 1) * 3]!,
        y: positions[(i + 1) * 3 + 1]!,
        z: positions[(i + 1) * 3 + 2]!,
      }
      const v2: Point3 = {
        x: positions[(i + 2) * 3]!,
        y: positions[(i + 2) * 3 + 1]!,
        z: positions[(i + 2) * 3 + 2]!,
      }

      let normal: Point3
      if (normals) {
        // Use provided normal (average of vertex normals)
        normal = {
          x: (normals[i * 3]! + normals[(i + 1) * 3]! + normals[(i + 2) * 3]!) / 3,
          y: (normals[i * 3 + 1]! + normals[(i + 1) * 3 + 1]! + normals[(i + 2) * 3 + 1]!) / 3,
          z: (normals[i * 3 + 2]! + normals[(i + 1) * 3 + 2]! + normals[(i + 2) * 3 + 2]!) / 3,
        }
      } else {
        // Calculate normal from triangle vertices
        normal = calculateNormal(v0, v1, v2)
      }

      triangles.push({
        vertices: [v0, v1, v2],
        normal,
      })
    }
  }

  return triangles
}

function calculateNormal(v0: Point3, v1: Point3, v2: Point3): Point3 {
  const edge1 = {
    x: v1.x - v0.x,
    y: v1.y - v0.y,
    z: v1.z - v0.z,
  }
  const edge2 = {
    x: v2.x - v0.x,
    y: v2.y - v0.y,
    z: v2.z - v0.z,
  }

  const normal = {
    x: edge1.y * edge2.z - edge1.z * edge2.y,
    y: edge1.z * edge2.x - edge1.x * edge2.z,
    z: edge1.x * edge2.y - edge1.y * edge2.x,
  }

  // Normalize
  const length = Math.sqrt(normal.x * normal.x + normal.y * normal.y + normal.z * normal.z)
  if (length > 0) {
    normal.x /= length
    normal.y /= length
    normal.z /= length
  }

  return normal
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