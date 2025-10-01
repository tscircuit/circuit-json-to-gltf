import type { CoordinateTransformConfig, STLMesh, Triangle } from "../types"
import {
  transformTriangles,
  COORDINATE_TRANSFORMS,
} from "../utils/coordinate-transform"

const gltfCache = new Map<string, STLMesh>()

export async function loadGLTFFromFootprinter(
  footprinterString: string,
  transform?: CoordinateTransformConfig,
): Promise<{ mesh: STLMesh; url: string }> {
  const baseUrl =
    "https://modelcdn.tscircuit.com/jscad_models/" + footprinterString
  const glbUrl = `${baseUrl}.glb`
  const gltfUrl = `${baseUrl}.gltf`

  let lastError: unknown

  try {
    const mesh = await loadGLTFMesh(glbUrl, transform)
    return { mesh, url: glbUrl }
  } catch (error) {
    lastError = error
  }

  try {
    const mesh = await loadGLTFMesh(gltfUrl, transform)
    return { mesh, url: gltfUrl }
  } catch (error) {
    throw new Error(
      `Failed to load footprinter model ${footprinterString}: ${String(
        lastError,
      )}; ${String(error)}`,
    )
  }
}

export async function loadGLTFMesh(
  url: string,
  transform?: CoordinateTransformConfig,
): Promise<STLMesh> {
  const cacheKey = `${url}:${JSON.stringify(transform ?? {})}`
  if (gltfCache.has(cacheKey)) {
    return gltfCache.get(cacheKey)!
  }

  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch GLTF model from ${url}: ${response.status}`,
    )
  }

  let mesh: STLMesh
  if (url.toLowerCase().endsWith(".gltf")) {
    const gltfJson = await response.json()
    mesh = await parseGLTFJson(gltfJson, url, transform)
  } else {
    const buffer = await response.arrayBuffer()
    mesh = parseGLB(buffer, transform)
  }

  gltfCache.set(cacheKey, mesh)
  return mesh
}

export function clearGLTFCaches(): void {
  gltfCache.clear()
}

async function parseGLTFJson(
  gltfJson: any,
  sourceUrl: string,
  transform?: CoordinateTransformConfig,
): Promise<STLMesh> {
  const buffers: ArrayBuffer[] = []
  const baseUrl = sourceUrl.slice(0, sourceUrl.lastIndexOf("/") + 1)

  for (const bufferDef of gltfJson.buffers ?? []) {
    if (typeof bufferDef.uri === "string") {
      buffers.push(await loadGLTFBuffer(bufferDef.uri, baseUrl))
    } else {
      buffers.push(new ArrayBuffer(bufferDef.byteLength ?? 0))
    }
  }

  return parseGLTFWithBuffers(gltfJson, buffers, transform)
}

function parseGLB(
  buffer: ArrayBuffer,
  transform?: CoordinateTransformConfig,
): STLMesh {
  const view = new DataView(buffer)
  const magic = view.getUint32(0, true)
  if (magic !== 0x46546c67) {
    throw new Error("Invalid GLB file: incorrect magic header")
  }

  const version = view.getUint32(4, true)
  if (version !== 2) {
    throw new Error(`Unsupported GLB version: ${version}`)
  }

  const length = view.getUint32(8, true)
  if (length !== buffer.byteLength) {
    throw new Error("GLB length mismatch")
  }

  let offset = 12
  let jsonChunk: any = null
  let binaryChunk: ArrayBuffer | null = null

  while (offset < buffer.byteLength) {
    const chunkLength = view.getUint32(offset, true)
    offset += 4
    const chunkType = view.getUint32(offset, true)
    offset += 4

    if (chunkType === 0x4e4f534a) {
      const chunkData = buffer.slice(offset, offset + chunkLength)
      const jsonText = new TextDecoder().decode(chunkData)
      jsonChunk = JSON.parse(jsonText)
    } else if (chunkType === 0x004e4942) {
      binaryChunk = buffer.slice(offset, offset + chunkLength)
    }

    offset += chunkLength
  }

  if (!jsonChunk) {
    throw new Error("GLB file missing JSON chunk")
  }

  const buffers = [] as ArrayBuffer[]
  if (binaryChunk) {
    buffers.push(binaryChunk)
  }

  return parseGLTFWithBuffers(jsonChunk, buffers, transform)
}

async function loadGLTFBuffer(
  uri: string,
  baseUrl: string,
): Promise<ArrayBuffer> {
  if (uri.startsWith("data:")) {
    const base64Index = uri.indexOf(",")
    const base64Data = uri.slice(base64Index + 1)
    const binary = decodeBase64(base64Data)
    const result = new Uint8Array(binary.byteLength)
    result.set(binary)
    return result.buffer
  }

  const bufferUrl = new URL(uri, baseUrl).href
  const response = await fetch(bufferUrl)
  if (!response.ok) {
    throw new Error(
      `Failed to fetch GLTF buffer ${uri} (resolved to ${bufferUrl}): ${response.status}`,
    )
  }
  return await response.arrayBuffer()
}

function parseGLTFWithBuffers(
  gltf: any,
  buffers: ArrayBuffer[],
  transform?: CoordinateTransformConfig,
): STLMesh {
  const triangles: Triangle[] = []

  for (const mesh of gltf.meshes ?? []) {
    for (const primitive of mesh.primitives ?? []) {
      const positionAccessorIndex = primitive.attributes?.POSITION
      if (positionAccessorIndex == null) continue

      if (primitive.mode != null && primitive.mode !== 4) {
        continue // only support TRIANGLES mode
      }

      const positionData = readAccessor(gltf, buffers, positionAccessorIndex)
      if (!positionData) continue

      const indices =
        primitive.indices != null
          ? readIndices(gltf, buffers, primitive.indices)
          : undefined

      const vertexCount = positionData.values.length / 3
      const positions: Array<{ x: number; y: number; z: number }> = []
      for (let i = 0; i < vertexCount; i++) {
        positions.push({
          x: positionData.values[i * 3]!,
          y: positionData.values[i * 3 + 1]!,
          z: positionData.values[i * 3 + 2]!,
        })
      }

      if (indices) {
        for (let i = 0; i + 2 < indices.length; i += 3) {
          const a = indices[i]!
          const b = indices[i + 1]!
          const c = indices[i + 2]!
          triangles.push(
            createTriangle(positions[a]!, positions[b]!, positions[c]!),
          )
        }
      } else {
        for (let i = 0; i + 2 < vertexCount; i += 3) {
          triangles.push(
            createTriangle(positions[i]!, positions[i + 1]!, positions[i + 2]!),
          )
        }
      }
    }
  }

  const finalTransform = transform ?? COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP
  const transformedTriangles = transformTriangles(triangles, finalTransform)
  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox(transformedTriangles),
  }
}

function createTriangle(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  c: { x: number; y: number; z: number },
): Triangle {
  const normal = computeFaceNormal(a, b, c)
  return {
    vertices: [a, b, c],
    normal,
  }
}

function computeFaceNormal(
  a: { x: number; y: number; z: number },
  b: { x: number; y: number; z: number },
  c: { x: number; y: number; z: number },
): { x: number; y: number; z: number } {
  const ux = b.x - a.x
  const uy = b.y - a.y
  const uz = b.z - a.z
  const vx = c.x - a.x
  const vy = c.y - a.y
  const vz = c.z - a.z

  const nx = uy * vz - uz * vy
  const ny = uz * vx - ux * vz
  const nz = ux * vy - uy * vx

  const length = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1
  return { x: nx / length, y: ny / length, z: nz / length }
}

function calculateBoundingBox(triangles: Triangle[]) {
  if (triangles.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    }
  }

  let minX = Infinity
  let minY = Infinity
  let minZ = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let maxZ = -Infinity

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

function readAccessor(
  gltf: any,
  buffers: ArrayBuffer[],
  accessorIndex: number,
): { values: Float32Array } | undefined {
  const accessor = gltf.accessors?.[accessorIndex]
  if (!accessor) return undefined
  if (accessor.sparse) {
    throw new Error("Sparse accessors are not supported")
  }

  const bufferViewIndex = accessor.bufferView
  if (bufferViewIndex == null) return undefined
  const bufferView = gltf.bufferViews?.[bufferViewIndex]
  if (!bufferView) return undefined

  const buffer = buffers[bufferView.buffer]
  if (!buffer) return undefined

  const componentType = accessor.componentType
  if (componentType !== 5126) {
    throw new Error(`Unsupported accessor component type: ${componentType}`)
  }

  const numComponents = getNumComponents(accessor.type)
  const byteStride = bufferView.byteStride ?? numComponents * 4
  const count = accessor.count

  const values = new Float32Array(count * numComponents)
  const viewByteOffset = bufferView.byteOffset ?? 0
  const viewByteLength =
    bufferView.byteLength ?? buffer.byteLength - viewByteOffset
  const dataView = new DataView(buffer, viewByteOffset, viewByteLength)

  for (let i = 0; i < count; i++) {
    const offset = (accessor.byteOffset ?? 0) + i * byteStride
    for (let j = 0; j < numComponents; j++) {
      values[i * numComponents + j] = dataView.getFloat32(offset + j * 4, true)
    }
  }

  return { values }
}

function readIndices(
  gltf: any,
  buffers: ArrayBuffer[],
  accessorIndex: number,
): Uint32Array | undefined {
  const accessor = gltf.accessors?.[accessorIndex]
  if (!accessor) return undefined
  const bufferViewIndex = accessor.bufferView
  if (bufferViewIndex == null) return undefined
  const bufferView = gltf.bufferViews?.[bufferViewIndex]
  if (!bufferView) return undefined

  const buffer = buffers[bufferView.buffer]
  if (!buffer) return undefined

  const componentType = accessor.componentType
  const byteStride = bufferView.byteStride ?? 0
  const count = accessor.count

  const dataView = new DataView(buffer)
  const indices = new Uint32Array(count)

  for (let i = 0; i < count; i++) {
    const offset =
      (bufferView.byteOffset ?? 0) +
      (accessor.byteOffset ?? 0) +
      (byteStride || getComponentSize(componentType)) * i

    indices[i] = readIndexValue(dataView, componentType, offset)
  }

  return indices
}

function readIndexValue(
  dataView: DataView,
  componentType: number,
  offset: number,
): number {
  switch (componentType) {
    case 5121:
      return dataView.getUint8(offset)
    case 5123:
      return dataView.getUint16(offset, true)
    case 5125:
      return dataView.getUint32(offset, true)
    default:
      throw new Error(`Unsupported index component type: ${componentType}`)
  }
}

function getComponentSize(componentType: number): number {
  switch (componentType) {
    case 5120:
    case 5121:
      return 1
    case 5122:
    case 5123:
      return 2
    case 5124:
    case 5125:
      return 4
    case 5126:
      return 4
    default:
      throw new Error(`Unsupported component type: ${componentType}`)
  }
}

function getNumComponents(type: string): number {
  switch (type) {
    case "SCALAR":
      return 1
    case "VEC2":
      return 2
    case "VEC3":
      return 3
    case "VEC4":
      return 4
    case "MAT2":
      return 4
    case "MAT3":
      return 9
    case "MAT4":
      return 16
    default:
      throw new Error(`Unsupported accessor type: ${type}`)
  }
}

function decodeBase64(data: string): Uint8Array {
  if (typeof atob === "function") {
    const binaryString = atob(data)
    const length = binaryString.length
    const bytes = new Uint8Array(length)
    for (let i = 0; i < length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes
  }

  const globalBuffer =
    typeof globalThis !== "undefined" ? (globalThis as any).Buffer : undefined
  if (globalBuffer) {
    const buffer = globalBuffer.from(data, "base64")
    return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
  }

  throw new Error("No base64 decoder available in this environment")
}
