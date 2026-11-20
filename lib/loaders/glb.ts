import type {
  AuthHeaders,
  CoordinateTransformConfig,
  OBJMaterial,
  OBJMesh,
  Point3,
  STLMesh,
  Triangle,
} from "../types"
import { boundsOfTriangles } from "../utils/bounding-box"
import { transformTriangles } from "../utils/coordinate-transform"
import {
  applyNodeTransformToTriangle,
  buildMeshTransforms,
  composeNodeTransforms,
} from "../utils/gltf-node-transforms"
import { fetchWithTimeout } from "./fetch-with-timeout"
import { resolveModelUrl } from "./resolve-model-url"

const glbCache = new Map<string, STLMesh | OBJMesh>()

export async function loadGLB({
  url,
  transform,
  projectBaseUrl,
  authHeaders,
}: {
  url: string
  transform?: CoordinateTransformConfig
  projectBaseUrl?: string
  authHeaders?: AuthHeaders
}): Promise<STLMesh | OBJMesh> {
  const resolvedUrl = await resolveModelUrl(url, projectBaseUrl)
  const cacheKey = `${resolvedUrl}:${JSON.stringify(transform ?? {})}`
  if (glbCache.has(cacheKey)) {
    return glbCache.get(cacheKey)!
  }

  const response = await fetchWithTimeout(resolvedUrl, { authHeaders })
  if (!response.ok) {
    throw new Error(
      `Failed to fetch GLB: ${response.status} ${response.statusText}`,
    )
  }
  const buffer = await response.arrayBuffer()
  const mesh = parseGLB(buffer, transform)
  glbCache.set(cacheKey, mesh)
  return mesh
}

export function parseGLB(
  buffer: ArrayBuffer,
  transform?: CoordinateTransformConfig,
): STLMesh | OBJMesh {
  const view = new DataView(buffer)
  let offset = 0

  // GLB header (12 bytes)
  const magic = view.getUint32(offset, true)
  offset += 4
  if (magic !== 0x46546c67) {
    // "glTF" in ASCII
    throw new Error("Invalid GLB file: incorrect magic number")
  }

  const version = view.getUint32(offset, true)
  offset += 4
  if (version !== 2) {
    throw new Error(`Unsupported GLB version: ${version}`)
  }

  const length = view.getUint32(offset, true)
  offset += 4

  // Chunk 0: JSON
  const jsonChunkLength = view.getUint32(offset, true)
  offset += 4
  const jsonChunkType = view.getUint32(offset, true)
  offset += 4
  if (jsonChunkType !== 0x4e4f534a) {
    // "JSON" in ASCII
    throw new Error("Expected JSON chunk")
  }

  const jsonBytes = new Uint8Array(buffer, offset, jsonChunkLength)
  const jsonString = new TextDecoder().decode(jsonBytes)
  const gltf = JSON.parse(jsonString)
  offset += jsonChunkLength

  // Chunk 1: Binary buffer (optional, but typically present)
  let binaryBuffer: ArrayBuffer | undefined
  if (offset < length) {
    const binaryChunkLength = view.getUint32(offset, true)
    offset += 4
    const binaryChunkType = view.getUint32(offset, true)
    offset += 4
    if (binaryChunkType === 0x004e4942) {
      // "BIN\0" in ASCII
      binaryBuffer = buffer.slice(offset, offset + binaryChunkLength)
    }
  }
  // Extract geometry and embedded material definitions from GLTF
  const { triangles, extractedMaterials } = extractTrianglesFromGLTF(
    gltf,
    binaryBuffer,
  )

  // Apply coordinate transformation
  // GLB files from JSCAD have Y and Z swapped relative to our coordinate system
  const finalConfig = transform ?? {
    axisMapping: { x: "x" as const, y: "z" as const, z: "y" as const },
  }
  const transformedTriangles = transformTriangles(triangles, finalConfig)

  // Check if any triangles have colors or textured/PBR materials
  const hasMaterials =
    extractedMaterials.size > 0 ||
    transformedTriangles.some((t) => t.color !== undefined)

  if (hasMaterials) {
    // Group triangles by material/color and return as OBJMesh
    return convertToOBJMesh(transformedTriangles, extractedMaterials)
  }

  return {
    triangles: transformedTriangles,
    boundingBox: boundsOfTriangles(transformedTriangles),
  }
}

function convertToOBJMesh(
  triangles: Triangle[],
  extractedMaterials: Map<number, OBJMaterial>,
): OBJMesh {
  // Group triangles by extracted glTF material + resolved triangle color so
  // distinct textured surfaces (e.g. top and bottom PCB textures sharing white
  // baseColorFactor) stay separate while vertex-colored primitives still group.
  const materialGroups = new Map<
    string,
    { baseMaterial?: OBJMaterial; colorKey: string; triangles: Triangle[] }
  >()

  for (const triangle of triangles) {
    const baseMaterial =
      triangle.materialIndex !== undefined
        ? extractedMaterials.get(triangle.materialIndex)
        : undefined
    const colorKey = triangle.color ? JSON.stringify(triangle.color) : "default"
    const groupKey =
      triangle.materialIndex !== undefined
        ? `gltf:${triangle.materialIndex}:${colorKey}`
        : `color:${colorKey}`
    let group = materialGroups.get(groupKey)
    if (!group) {
      group = { baseMaterial, colorKey, triangles: [] }
      materialGroups.set(groupKey, group)
    }
    group.triangles.push(triangle)
  }

  // Create materials and assign material indices
  const materials = new Map<string, OBJMaterial>()
  const materialIndexMap = new Map<string, number>()
  let materialIndex = 0

  const trianglesWithMaterialIndex: Triangle[] = []

  for (const [, group] of materialGroups) {
    const materialName = `Material_${materialIndex}`
    materialIndexMap.set(materialName, materialIndex)

    if (group.baseMaterial) {
      const resolvedColor =
        group.colorKey !== "default"
          ? JSON.parse(group.colorKey)
          : group.baseMaterial.color
      materials.set(materialName, {
        ...group.baseMaterial,
        name: materialName,
        ...(resolvedColor ? { color: resolvedColor } : {}),
      })
    } else if (group.colorKey === "default") {
      // Default gray material
      materials.set(materialName, {
        name: materialName,
        color: [179, 179, 179, 1.0], // 0.7 * 255 = 179
      })
    } else {
      const color = JSON.parse(group.colorKey)
      materials.set(materialName, {
        name: materialName,
        color,
      })
    }

    // Add triangles with material index
    for (const triangle of group.triangles) {
      trianglesWithMaterialIndex.push({
        ...triangle,
        materialIndex,
      })
    }

    materialIndex++
  }

  return {
    triangles: trianglesWithMaterialIndex,
    boundingBox: boundsOfTriangles(trianglesWithMaterialIndex),
    materials,
    materialIndexMap,
  }
}

function sniffImageMimeType(bytes: Uint8Array): string | undefined {
  if (
    bytes.length >= 4 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47
  ) {
    return "image/png"
  }
  if (
    bytes.length >= 3 &&
    bytes[0] === 0xff &&
    bytes[1] === 0xd8 &&
    bytes[2] === 0xff
  ) {
    return "image/jpeg"
  }
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "image/webp"
  }
  return undefined
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(
      bytes.buffer,
      bytes.byteOffset,
      bytes.byteLength,
    ).toString("base64")
  }
  let binary = ""
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

function resolveBaseColorTextureDataUrl(
  material: any,
  gltf: any,
  binaryBuffer: ArrayBuffer | undefined,
  imageDataUrlCache: Map<number, string | undefined>,
): string | undefined {
  const texInfo = material?.pbrMetallicRoughness?.baseColorTexture
  if (texInfo?.index === undefined) return undefined
  const texture = gltf.textures?.[texInfo.index]
  const imageIndex = texture?.source
  if (typeof imageIndex !== "number") return undefined

  if (imageDataUrlCache.has(imageIndex)) {
    return imageDataUrlCache.get(imageIndex)
  }

  const image = gltf.images?.[imageIndex]
  if (!image) {
    imageDataUrlCache.set(imageIndex, undefined)
    return undefined
  }

  let dataUrl: string | undefined
  if (typeof image.uri === "string" && image.uri.startsWith("data:image/")) {
    dataUrl = image.uri
  } else if (typeof image.bufferView === "number" && binaryBuffer) {
    const bufferView = gltf.bufferViews?.[image.bufferView]
    if (bufferView) {
      const byteOffset = bufferView.byteOffset ?? 0
      const byteLength = bufferView.byteLength ?? 0
      if (
        byteOffset >= 0 &&
        byteLength > 0 &&
        byteOffset + byteLength <= binaryBuffer.byteLength
      ) {
        const bytes = new Uint8Array(binaryBuffer, byteOffset, byteLength)
        const mimeType =
          image.mimeType || sniffImageMimeType(bytes) || "image/png"
        dataUrl = `data:${mimeType};base64,${bytesToBase64(bytes)}`
      }
    }
  }

  imageDataUrlCache.set(imageIndex, dataUrl)
  return dataUrl
}

function readVertexUv(
  texcoords: Float32Array,
  vertexIndex: number,
  textureTransform?: {
    offset?: [number, number]
    rotation?: number
    scale?: [number, number]
  },
): { u: number; v: number } {
  let u = texcoords[vertexIndex * 2]!
  let v = texcoords[vertexIndex * 2 + 1]!
  if (textureTransform) {
    const [sx, sy] = textureTransform.scale ?? [1, 1]
    u *= sx
    v *= sy
    if (textureTransform.rotation) {
      const cos = Math.cos(textureTransform.rotation)
      const sin = Math.sin(textureTransform.rotation)
      const ru = u * cos + v * sin
      const rv = -u * sin + v * cos
      u = ru
      v = rv
    }
    if (textureTransform.offset) {
      u += textureTransform.offset[0]
      v += textureTransform.offset[1]
    }
  }
  return { u, v }
}

function extractTrianglesFromGLTF(
  gltf: any,
  binaryBuffer?: ArrayBuffer,
): { triangles: Triangle[]; extractedMaterials: Map<number, OBJMaterial> } {
  const triangles: Triangle[] = []
  const extractedMaterials = new Map<number, OBJMaterial>()
  const imageDataUrlCache = new Map<number, string | undefined>()

  if (!gltf.meshes || !gltf.accessors || !gltf.bufferViews) {
    return { triangles, extractedMaterials }
  }

  // Build mesh transforms from node hierarchy
  const meshTransforms = buildMeshTransforms(gltf)

  // Process each mesh
  for (let meshIndex = 0; meshIndex < gltf.meshes.length; meshIndex++) {
    const mesh = gltf.meshes[meshIndex]
    const worldMatrix = composeNodeTransforms(
      meshTransforms.get(meshIndex) ?? [],
    )
    for (const primitive of mesh.primitives) {
      // Only support TRIANGLES mode
      const mode = primitive.mode ?? 4 // Default to TRIANGLES (4)
      if (mode !== 4) {
        continue // Skip non-triangle primitives
      }

      // Get position accessor
      const positionAccessorIndex = primitive.attributes.POSITION
      if (positionAccessorIndex === undefined) {
        continue
      }

      const positionAccessor = gltf.accessors[positionAccessorIndex]
      const positions = getAccessorData(
        positionAccessor,
        gltf.bufferViews,
        binaryBuffer,
      )

      // Get normal accessor (optional)
      let normals: Float32Array | undefined
      const normalAccessorIndex = primitive.attributes.NORMAL
      if (normalAccessorIndex !== undefined) {
        const normalAccessor = gltf.accessors[normalAccessorIndex]
        normals = getAccessorData(
          normalAccessor,
          gltf.bufferViews,
          binaryBuffer,
        )
      }

      // Get vertex colors (COLOR_0 attribute, if present)
      let vertexColors: Float32Array | undefined
      const colorAccessorIndex = primitive.attributes.COLOR_0
      if (colorAccessorIndex !== undefined) {
        const colorAccessor = gltf.accessors[colorAccessorIndex]
        vertexColors = getAccessorData(
          colorAccessor,
          gltf.bufferViews,
          binaryBuffer,
        )
      }

      // Resolve glTF material color, texture, and PBR properties
      let materialColor: [number, number, number, number] | undefined
      let extractedMaterialIndex: number | undefined
      const material =
        primitive.material !== undefined && gltf.materials
          ? gltf.materials[primitive.material]
          : undefined
      const pbr = material?.pbrMetallicRoughness
      const textureDataUrl = material
        ? resolveBaseColorTextureDataUrl(
            material,
            gltf,
            binaryBuffer,
            imageDataUrlCache,
          )
        : undefined

      if (material) {
        if (pbr?.baseColorFactor) {
          const factor = pbr.baseColorFactor
          // Convert from 0-1 range to 0-255 range for our Color type
          materialColor = [
            Math.round(factor[0] * 255),
            Math.round(factor[1] * 255),
            Math.round(factor[2] * 255),
            factor[3] ?? 1.0,
          ]
        } else if (textureDataUrl) {
          // glTF 2.0 default baseColorFactor is [1, 1, 1, 1]
          materialColor = [255, 255, 255, 1.0]
        }

        if (textureDataUrl) {
          extractedMaterialIndex = primitive.material as number
          if (!extractedMaterials.has(extractedMaterialIndex)) {
            extractedMaterials.set(extractedMaterialIndex, {
              name: material.name || `GLTFMaterial_${extractedMaterialIndex}`,
              color: materialColor ?? [255, 255, 255, 1.0],
              textureDataUrl,
              metallicFactor:
                typeof pbr?.metallicFactor === "number"
                  ? pbr.metallicFactor
                  : undefined,
              roughnessFactor:
                typeof pbr?.roughnessFactor === "number"
                  ? pbr.roughnessFactor
                  : undefined,
              alphaMode: material.alphaMode,
              alphaCutoff: material.alphaCutoff,
              doubleSided: material.doubleSided,
            })
          }
        }
      }

      // Get texture coordinates (TEXCOORD_n, defaulting to TEXCOORD_0)
      let texcoords: Float32Array | undefined
      const texCoordSet = pbr?.baseColorTexture?.texCoord ?? 0
      const texcoordAccessorIndex =
        primitive.attributes?.[`TEXCOORD_${texCoordSet}`] ??
        primitive.attributes?.TEXCOORD_0
      if (
        texcoordAccessorIndex !== undefined &&
        gltf.accessors?.[texcoordAccessorIndex]
      ) {
        texcoords = getAccessorData(
          gltf.accessors[texcoordAccessorIndex],
          gltf.bufferViews,
          binaryBuffer,
        )
      }
      const textureTransform =
        pbr?.baseColorTexture?.extensions?.KHR_texture_transform

      // Get indices (if present)
      // Note: getAccessorData returns Float32Array with correct values
      // We use it directly since the values are already correct integers stored as floats
      let indices: Float32Array | undefined
      if (primitive.indices !== undefined) {
        const indexAccessor = gltf.accessors[primitive.indices]
        indices = getAccessorData(indexAccessor, gltf.bufferViews, binaryBuffer)
      }

      // Build triangles
      const vertexCount = positions.length / 3
      if (indices) {
        for (let i = 0; i < indices.length; i += 3) {
          const i0 = indices[i]!
          const i1 = indices[i + 1]!
          const i2 = indices[i + 2]!

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
            // Average normals of the three vertices
            const n: Point3 = {
              x: (normals[i0 * 3]! + normals[i1 * 3]! + normals[i2 * 3]!) / 3,
              y:
                (normals[i0 * 3 + 1]! +
                  normals[i1 * 3 + 1]! +
                  normals[i2 * 3 + 1]!) /
                3,
              z:
                (normals[i0 * 3 + 2]! +
                  normals[i1 * 3 + 2]! +
                  normals[i2 * 3 + 2]!) /
                3,
            }
            normal = n
          } else {
            // Compute the source normal before baking the node transform
            normal = computeNormal(v0, v1, v2)
          }

          // Get triangle color from vertex colors or material
          let triangleColor: [number, number, number, number] | undefined
          if (vertexColors) {
            // Average the three vertex colors
            // Note: COLOR_0 can be RGB or RGBA, we'll handle both
            const componentsPerColor = vertexColors.length / vertexCount
            if (componentsPerColor === 3) {
              // RGB
              triangleColor = [
                Math.round(
                  ((vertexColors[i0 * 3]! +
                    vertexColors[i1 * 3]! +
                    vertexColors[i2 * 3]!) /
                    3) *
                    255,
                ),
                Math.round(
                  ((vertexColors[i0 * 3 + 1]! +
                    vertexColors[i1 * 3 + 1]! +
                    vertexColors[i2 * 3 + 1]!) /
                    3) *
                    255,
                ),
                Math.round(
                  ((vertexColors[i0 * 3 + 2]! +
                    vertexColors[i1 * 3 + 2]! +
                    vertexColors[i2 * 3 + 2]!) /
                    3) *
                    255,
                ),
                1.0,
              ]
            } else if (componentsPerColor === 4) {
              // RGBA
              triangleColor = [
                Math.round(
                  ((vertexColors[i0 * 4]! +
                    vertexColors[i1 * 4]! +
                    vertexColors[i2 * 4]!) /
                    3) *
                    255,
                ),
                Math.round(
                  ((vertexColors[i0 * 4 + 1]! +
                    vertexColors[i1 * 4 + 1]! +
                    vertexColors[i2 * 4 + 1]!) /
                    3) *
                    255,
                ),
                Math.round(
                  ((vertexColors[i0 * 4 + 2]! +
                    vertexColors[i1 * 4 + 2]! +
                    vertexColors[i2 * 4 + 2]!) /
                    3) *
                    255,
                ),
                (vertexColors[i0 * 4 + 3]! +
                  vertexColors[i1 * 4 + 3]! +
                  vertexColors[i2 * 4 + 3]!) /
                  3,
              ]
            }
          } else {
            triangleColor = materialColor
          }

          const uvs =
            texcoords && Math.max(i0, i1, i2) * 2 + 1 < texcoords.length
              ? ([
                  readVertexUv(texcoords, i0, textureTransform),
                  readVertexUv(texcoords, i1, textureTransform),
                  readVertexUv(texcoords, i2, textureTransform),
                ] as Triangle["uvs"])
              : undefined

          triangles.push(
            applyNodeTransformToTriangle(
              {
                vertices: [v0, v1, v2],
                normal,
                color: triangleColor,
                ...(uvs ? { uvs } : {}),
                ...(extractedMaterialIndex !== undefined
                  ? { materialIndex: extractedMaterialIndex }
                  : {}),
              },
              worldMatrix,
            ),
          )
        }
      } else {
        // No indices, vertices are in order
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
            const n: Point3 = {
              x:
                (normals[i * 3]! +
                  normals[(i + 1) * 3]! +
                  normals[(i + 2) * 3]!) /
                3,
              y:
                (normals[i * 3 + 1]! +
                  normals[(i + 1) * 3 + 1]! +
                  normals[(i + 2) * 3 + 1]!) /
                3,
              z:
                (normals[i * 3 + 2]! +
                  normals[(i + 1) * 3 + 2]! +
                  normals[(i + 2) * 3 + 2]!) /
                3,
            }
            normal = n
          } else {
            normal = computeNormal(v0, v1, v2)
          }

          // Get triangle color from vertex colors or material
          let triangleColor: [number, number, number, number] | undefined
          if (vertexColors) {
            // Average the three vertex colors
            const componentsPerColor = vertexColors.length / vertexCount
            if (componentsPerColor === 3) {
              // RGB
              triangleColor = [
                Math.round(
                  ((vertexColors[i * 3]! +
                    vertexColors[(i + 1) * 3]! +
                    vertexColors[(i + 2) * 3]!) /
                    3) *
                    255,
                ),
                Math.round(
                  ((vertexColors[i * 3 + 1]! +
                    vertexColors[(i + 1) * 3 + 1]! +
                    vertexColors[(i + 2) * 3 + 1]!) /
                    3) *
                    255,
                ),
                Math.round(
                  ((vertexColors[i * 3 + 2]! +
                    vertexColors[(i + 1) * 3 + 2]! +
                    vertexColors[(i + 2) * 3 + 2]!) /
                    3) *
                    255,
                ),
                1.0,
              ]
            } else if (componentsPerColor === 4) {
              // RGBA
              triangleColor = [
                Math.round(
                  ((vertexColors[i * 4]! +
                    vertexColors[(i + 1) * 4]! +
                    vertexColors[(i + 2) * 4]!) /
                    3) *
                    255,
                ),
                Math.round(
                  ((vertexColors[i * 4 + 1]! +
                    vertexColors[(i + 1) * 4 + 1]! +
                    vertexColors[(i + 2) * 4 + 1]!) /
                    3) *
                    255,
                ),
                Math.round(
                  ((vertexColors[i * 4 + 2]! +
                    vertexColors[(i + 1) * 4 + 2]! +
                    vertexColors[(i + 2) * 4 + 2]!) /
                    3) *
                    255,
                ),
                (vertexColors[i * 4 + 3]! +
                  vertexColors[(i + 1) * 4 + 3]! +
                  vertexColors[(i + 2) * 4 + 3]!) /
                  3,
              ]
            }
          } else {
            triangleColor = materialColor
          }

          const uvs =
            texcoords && (i + 2) * 2 + 1 < texcoords.length
              ? ([
                  readVertexUv(texcoords, i, textureTransform),
                  readVertexUv(texcoords, i + 1, textureTransform),
                  readVertexUv(texcoords, i + 2, textureTransform),
                ] as Triangle["uvs"])
              : undefined

          triangles.push(
            applyNodeTransformToTriangle(
              {
                vertices: [v0, v1, v2],
                normal,
                color: triangleColor,
                ...(uvs ? { uvs } : {}),
                ...(extractedMaterialIndex !== undefined
                  ? { materialIndex: extractedMaterialIndex }
                  : {}),
              },
              worldMatrix,
            ),
          )
        }
      }
    }
  }

  return { triangles, extractedMaterials }
}

function getAccessorData(
  accessor: any,
  bufferViews: any[],
  binaryBuffer?: ArrayBuffer,
): Float32Array {
  const bufferView = bufferViews[accessor.bufferView]
  if (!bufferView || !binaryBuffer) {
    throw new Error("Missing buffer data")
  }

  const byteOffset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0)
  const componentType = accessor.componentType
  const count = accessor.count
  const type = accessor.type

  // Get number of components per element
  const componentsPerElement =
    type === "SCALAR"
      ? 1
      : type === "VEC2"
        ? 2
        : type === "VEC3"
          ? 3
          : type === "VEC4"
            ? 4
            : 1

  const totalComponents = count * componentsPerElement

  const componentSize =
    componentType === 5120 || componentType === 5121
      ? 1
      : componentType === 5122 || componentType === 5123
        ? 2
        : 4
  const elementSize = componentSize * componentsPerElement
  const stride = bufferView.byteStride ?? elementSize

  // Keep the zero-copy path for tightly packed FLOAT attributes.
  if (componentType === 5126 && stride === elementSize) {
    return new Float32Array(binaryBuffer, byteOffset, totalComponents)
  }

  const view = new DataView(binaryBuffer)
  const result = new Float32Array(totalComponents)
  for (let element = 0; element < count; element++) {
    for (let component = 0; component < componentsPerElement; component++) {
      const offset = byteOffset + element * stride + component * componentSize
      let value: number
      switch (componentType) {
        case 5120: // BYTE
          value = view.getInt8(offset)
          if (accessor.normalized) value = Math.max(value / 127, -1)
          break
        case 5121: // UNSIGNED_BYTE
          value = view.getUint8(offset)
          if (accessor.normalized) value /= 255
          break
        case 5122: // SHORT
          value = view.getInt16(offset, true)
          if (accessor.normalized) value = Math.max(value / 32767, -1)
          break
        case 5123: // UNSIGNED_SHORT
          value = view.getUint16(offset, true)
          if (accessor.normalized) value /= 65535
          break
        case 5124: // INT (retained for compatibility)
          value = view.getInt32(offset, true)
          break
        case 5125: // UNSIGNED_INT
          value = view.getUint32(offset, true)
          break
        case 5126: // FLOAT
          value = view.getFloat32(offset, true)
          break
        default:
          throw new Error(`Unsupported component type: ${componentType}`)
      }
      result[element * componentsPerElement + component] = value
    }
  }
  return result
}

function computeNormal(v0: Point3, v1: Point3, v2: Point3): Point3 {
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

  return {
    x: edge1.y * edge2.z - edge1.z * edge2.y,
    y: edge1.z * edge2.x - edge1.x * edge2.z,
    z: edge1.x * edge2.y - edge1.y * edge2.x,
  }
}

export function clearGLBCache() {
  glbCache.clear()
}
