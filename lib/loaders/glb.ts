import type {
  CoordinateTransformConfig,
  OBJMaterial,
  OBJMesh,
  Point3,
  STLMesh,
  Triangle,
} from "../types"
import {
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "../utils/coordinate-transform"
import {
  applyNodeTransform,
  applyQuaternion,
  buildMeshTransforms,
} from "../utils/gltf-node-transforms"
import { resolveModelUrl } from "./resolve-model-url"
import type { PlatformConfig } from "@tscircuit/props"

const glbCache = new Map<string, STLMesh | OBJMesh>()

export async function loadGLB({
  url,
  transform,
  platformConfig,
}: {
  url: string
  transform?: CoordinateTransformConfig
  platformConfig?: PlatformConfig
}): Promise<STLMesh | OBJMesh> {
  const resolvedUrl = await resolveModelUrl(url, platformConfig)
  const cacheKey = `${resolvedUrl}:${JSON.stringify(transform ?? {})}`
  if (glbCache.has(cacheKey)) {
    return glbCache.get(cacheKey)!
  }

  const response = await fetch(resolvedUrl)
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
  // Extract geometry from GLTF
  const triangles = extractTrianglesFromGLTF(gltf, binaryBuffer)

  // Apply coordinate transformation
  // GLB files from JSCAD have Y and Z swapped relative to our coordinate system
  const finalConfig = transform ?? {
    axisMapping: { x: "x" as const, y: "z" as const, z: "y" as const },
  }
  const transformedTriangles = transformTriangles(triangles, finalConfig)

  // Check if any triangles have colors (materials)
  const hasColors = transformedTriangles.some((t) => t.color !== undefined)

  if (hasColors) {
    // Group triangles by color and return as OBJMesh
    return convertToOBJMesh(transformedTriangles)
  }

  return {
    triangles: transformedTriangles,
    boundingBox: calculateBoundingBox(transformedTriangles),
  }
}

function convertToOBJMesh(triangles: Triangle[]): OBJMesh {
  // Group triangles by color
  const colorGroups = new Map<string, Triangle[]>()

  for (const triangle of triangles) {
    const colorKey = triangle.color ? JSON.stringify(triangle.color) : "default"
    if (!colorGroups.has(colorKey)) {
      colorGroups.set(colorKey, [])
    }
    colorGroups.get(colorKey)!.push(triangle)
  }

  // Create materials and assign material indices
  const materials = new Map<string, OBJMaterial>()
  const materialIndexMap = new Map<string, number>()
  let materialIndex = 0

  const trianglesWithMaterialIndex: Triangle[] = []

  for (const [colorKey, groupTriangles] of colorGroups) {
    const materialName = `Material_${materialIndex}`
    materialIndexMap.set(materialName, materialIndex)

    if (colorKey === "default") {
      // Default gray material
      materials.set(materialName, {
        name: materialName,
        color: [179, 179, 179, 1.0], // 0.7 * 255 = 179
      })
    } else {
      const color = JSON.parse(colorKey)
      materials.set(materialName, {
        name: materialName,
        color,
      })
    }

    // Add triangles with material index
    for (const triangle of groupTriangles) {
      trianglesWithMaterialIndex.push({
        ...triangle,
        materialIndex,
      })
    }

    materialIndex++
  }

  return {
    triangles: trianglesWithMaterialIndex,
    boundingBox: calculateBoundingBox(trianglesWithMaterialIndex),
    materials,
    materialIndexMap,
  }
}

function extractTrianglesFromGLTF(
  gltf: any,
  binaryBuffer?: ArrayBuffer,
): Triangle[] {
  const triangles: Triangle[] = []

  if (!gltf.meshes || !gltf.accessors || !gltf.bufferViews) {
    return triangles
  }

  // Build mesh transforms from node hierarchy
  const meshTransforms = buildMeshTransforms(gltf)

  // Process each mesh
  for (let meshIndex = 0; meshIndex < gltf.meshes.length; meshIndex++) {
    const mesh = gltf.meshes[meshIndex]
    const transforms = meshTransforms.get(meshIndex) || []
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

      // Get material color (if present and no vertex colors)
      let materialColor: [number, number, number, number] | undefined
      if (!vertexColors && primitive.material !== undefined && gltf.materials) {
        const material = gltf.materials[primitive.material]
        if (material?.pbrMetallicRoughness?.baseColorFactor) {
          const factor = material.pbrMetallicRoughness.baseColorFactor
          // Convert from 0-1 range to 0-255 range for our Color type
          materialColor = [
            Math.round(factor[0] * 255),
            Math.round(factor[1] * 255),
            Math.round(factor[2] * 255),
            factor[3],
          ]
        }
      }

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

          let v0: Point3 = {
            x: positions[i0 * 3]!,
            y: positions[i0 * 3 + 1]!,
            z: positions[i0 * 3 + 2]!,
          }
          let v1: Point3 = {
            x: positions[i1 * 3]!,
            y: positions[i1 * 3 + 1]!,
            z: positions[i1 * 3 + 2]!,
          }
          let v2: Point3 = {
            x: positions[i2 * 3]!,
            y: positions[i2 * 3 + 1]!,
            z: positions[i2 * 3 + 2]!,
          }

          // Apply node transforms to vertices
          for (const transform of transforms) {
            v0 = applyNodeTransform(v0, transform)
            v1 = applyNodeTransform(v1, transform)
            v2 = applyNodeTransform(v2, transform)
          }

          let normal: Point3
          if (normals) {
            // Average normals of the three vertices
            let n: Point3 = {
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
            // Apply rotation transforms to normal (no translation)
            for (const transform of transforms) {
              if (transform.rotation) {
                n = applyQuaternion(
                  n,
                  transform.rotation as [number, number, number, number],
                )
              }
            }
            normal = n
          } else {
            // Compute normal from transformed vertices
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

          triangles.push({
            vertices: [v0, v1, v2],
            normal,
            color: triangleColor,
          })
        }
      } else {
        // No indices, vertices are in order
        for (let i = 0; i < vertexCount; i += 3) {
          let v0: Point3 = {
            x: positions[i * 3]!,
            y: positions[i * 3 + 1]!,
            z: positions[i * 3 + 2]!,
          }
          let v1: Point3 = {
            x: positions[(i + 1) * 3]!,
            y: positions[(i + 1) * 3 + 1]!,
            z: positions[(i + 1) * 3 + 2]!,
          }
          let v2: Point3 = {
            x: positions[(i + 2) * 3]!,
            y: positions[(i + 2) * 3 + 1]!,
            z: positions[(i + 2) * 3 + 2]!,
          }

          // Apply node transforms to vertices
          for (const transform of transforms) {
            v0 = applyNodeTransform(v0, transform)
            v1 = applyNodeTransform(v1, transform)
            v2 = applyNodeTransform(v2, transform)
          }

          let normal: Point3
          if (normals) {
            let n: Point3 = {
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
            // Apply rotation transforms to normal
            for (const transform of transforms) {
              if (transform.rotation) {
                n = applyQuaternion(
                  n,
                  transform.rotation as [number, number, number, number],
                )
              }
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

          triangles.push({
            vertices: [v0, v1, v2],
            normal,
            color: triangleColor,
          })
        }
      }
    }
  }

  return triangles
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

  // Convert to Float32Array based on component type
  if (componentType === 5126) {
    // FLOAT
    return new Float32Array(binaryBuffer, byteOffset, totalComponents)
  } else if (componentType === 5123) {
    // UNSIGNED_SHORT
    const uint16Array = new Uint16Array(
      binaryBuffer,
      byteOffset,
      totalComponents,
    )
    return new Float32Array(uint16Array)
  } else if (componentType === 5125) {
    // UNSIGNED_INT
    const uint32Array = new Uint32Array(
      binaryBuffer,
      byteOffset,
      totalComponents,
    )
    return new Float32Array(uint32Array)
  } else if (componentType === 5122) {
    // SHORT
    const int16Array = new Int16Array(binaryBuffer, byteOffset, totalComponents)
    return new Float32Array(int16Array)
  } else if (componentType === 5124) {
    // INT
    const int32Array = new Int32Array(binaryBuffer, byteOffset, totalComponents)
    return new Float32Array(int32Array)
  } else if (componentType === 5121) {
    // UNSIGNED_BYTE
    const uint8Array = new Uint8Array(binaryBuffer, byteOffset, totalComponents)
    return new Float32Array(uint8Array)
  } else if (componentType === 5120) {
    // BYTE
    const int8Array = new Int8Array(binaryBuffer, byteOffset, totalComponents)
    return new Float32Array(int8Array)
  }

  throw new Error(`Unsupported component type: ${componentType}`)
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

export function clearGLBCache() {
  glbCache.clear()
}
