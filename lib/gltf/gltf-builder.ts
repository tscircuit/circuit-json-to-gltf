import type { Scene3D, Box3D, Color, OBJMesh } from "../types"
import type {
  GLTF,
  GLTFScene,
  GLTFNode,
  GLTFMesh,
  GLTFBuffer,
  GLTFBufferView,
  GLTFAccessor,
  GLTFMaterial,
  GLTFTexture,
  GLTFImage,
} from "./gltf-types"
import {
  COMPONENT_TYPE,
  TARGET,
  PRIMITIVE_MODE,
  FILTER,
  WRAP,
} from "./gltf-types"
import { BufferBuilder } from "./buffer-builder"
import {
  createBoxMesh,
  createBoxMeshByFaces,
  createMeshFromSTL,
  createMeshFromOBJ,
  transformMesh,
  getBounds,
  type MeshData,
  type FaceMeshData,
} from "./geometry"

export class GLTFBuilder {
  private gltf: GLTF
  private bufferBuilder: BufferBuilder
  private nodes: GLTFNode[]
  private meshes: GLTFMesh[]
  private materials: GLTFMaterial[]
  private accessors: GLTFAccessor[]
  private bufferViews: GLTFBufferView[]
  private textures: GLTFTexture[]
  private images: GLTFImage[]
  private imageDataMap: Map<string, Uint8Array>

  constructor() {
    this.gltf = {
      asset: {
        version: "2.0",
        generator: "circuit-json-to-gltf",
      },
      scene: 0,
      scenes: [{ name: "Scene", nodes: [] }],
    }

    this.bufferBuilder = new BufferBuilder()
    this.nodes = []
    this.meshes = []
    this.materials = []
    this.accessors = []
    this.bufferViews = []
    this.textures = []
    this.images = []
    this.imageDataMap = new Map()
  }

  async buildFromScene3D(scene3D: Scene3D): Promise<void> {
    // Add default material
    const defaultMaterialIndex = this.addMaterial({
      name: "Default",
      pbrMetallicRoughness: {
        baseColorFactor: [0.35, 0.35, 0.35, 0.5],
        metallicFactor: 0.05,
        roughnessFactor: 0.95,
      },
      alphaMode: "BLEND",
    })

    // Process boxes
    for (const box of scene3D.boxes) {
      await this.addBox(box, defaultMaterialIndex)
    }
  }

  private async addBox(
    box: Box3D,
    defaultMaterialIndex: number,
  ): Promise<void> {
    // If we have face-specific textures or need green sides, use face-based approach
    if (box.texture && (box.texture.top || box.texture.bottom)) {
      await this.addBoxWithFaceMaterials(box, defaultMaterialIndex)
      return
    }

    // Handle OBJ meshes with materials
    if (box.mesh && "materials" in box.mesh && box.mesh.materials) {
      await this.addOBJMeshWithMaterials(box, box.mesh as OBJMesh)
      return
    }

    // Fallback to original single-material approach
    let meshData: MeshData

    // Create geometry
    if (box.mesh) {
      meshData = createMeshFromSTL(box.mesh)
    } else {
      meshData = createBoxMesh(box.size)
    }

    // Apply transformations
    meshData = transformMesh(meshData, box.center, box.rotation)

    // Create material
    let materialIndex = defaultMaterialIndex
    if (box.color) {
      materialIndex = this.addMaterialFromColor(box.color, !box.mesh)
    } else if (box.mesh) {
      // For meshes without a color, use an opaque light gray material
      materialIndex = this.addMaterial({
        name: `MeshMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [0.7, 0.7, 0.7, 1.0],
          metallicFactor: 0.1,
          roughnessFactor: 0.9,
        },
        alphaMode: "OPAQUE",
      })
    }

    // Create mesh
    const meshIndex = this.addMesh(meshData, materialIndex, box.label)

    // Create node
    const nodeIndex = this.nodes.length
    this.nodes.push({
      name: box.label || `Box${nodeIndex}`,
      mesh: meshIndex,
    })

    // Add node to scene
    this.gltf.scenes![0]!.nodes!.push(nodeIndex)
  }

  private async addOBJMeshWithMaterials(
    box: Box3D,
    objMesh: OBJMesh,
  ): Promise<void> {
    const meshDataArray = createMeshFromOBJ(objMesh)

    // Create materials from OBJ materials
    const objMaterialIndices = new Map<number, number>()

    for (const [name, objMaterial] of objMesh.materials!) {
      let baseColor: [number, number, number, number] = [0.3, 0.3, 0.3, 1.0]

      if (objMaterial.color) {
        const color =
          typeof objMaterial.color === "string"
            ? this.parseColorString(objMaterial.color)
            : [
                objMaterial.color[0] / 255,
                objMaterial.color[1] / 255,
                objMaterial.color[2] / 255,
                objMaterial.color[3], // Use the alpha from the color
              ]
        baseColor = [color[0]!, color[1]!, color[2]!, color[3]!]
      }

      // Override with dissolve if explicitly set
      const alpha =
        objMaterial.dissolve !== undefined
          ? 1.0 - objMaterial.dissolve
          : baseColor[3]
      baseColor[3] = alpha

      const gltfMaterialIndex = this.addMaterial({
        name: `OBJ_${name}`,
        pbrMetallicRoughness: {
          baseColorFactor: baseColor,
          metallicFactor: 0.05,
          roughnessFactor: 0.95,
        },
        alphaMode: alpha < 1.0 ? "BLEND" : "OPAQUE",
      })

      // Get the correct material index from the OBJ parsing
      const materialIndex = objMesh.materialIndexMap?.get(name) ?? -1
      objMaterialIndices.set(materialIndex, gltfMaterialIndex)
    }

    // Create primitives for each material group
    const primitives: any[] = []

    for (const { meshData, materialIndex } of meshDataArray) {
      const transformedMeshData = transformMesh(
        meshData,
        box.center,
        box.rotation,
      )

      const positionAccessorIndex = this.addAccessor(
        transformedMeshData.positions,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER,
      )

      const normalAccessorIndex = this.addAccessor(
        transformedMeshData.normals,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER,
      )

      const texcoordAccessorIndex = this.addAccessor(
        transformedMeshData.texcoords,
        "VEC2",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER,
      )

      const indicesAccessorIndex = this.addAccessor(
        transformedMeshData.indices,
        "SCALAR",
        COMPONENT_TYPE.UNSIGNED_SHORT,
        TARGET.ELEMENT_ARRAY_BUFFER,
      )

      const gltfMaterialIndex =
        objMaterialIndices.get(materialIndex) ??
        objMaterialIndices.values().next().value ??
        this.materials.length - 1

      primitives.push({
        attributes: {
          POSITION: positionAccessorIndex,
          NORMAL: normalAccessorIndex,
          TEXCOORD_0: texcoordAccessorIndex,
        },
        indices: indicesAccessorIndex,
        material: gltfMaterialIndex,
        mode: PRIMITIVE_MODE.TRIANGLES,
      })
    }

    // Create mesh with all material primitives
    const meshIndex = this.meshes.length
    this.meshes.push({
      name: box.label || `OBJMesh${meshIndex}`,
      primitives,
    })

    // Create node
    const nodeIndex = this.nodes.length
    this.nodes.push({
      name: box.label || `OBJBox${nodeIndex}`,
      mesh: meshIndex,
    })

    // Add node to scene
    this.gltf.scenes![0]!.nodes!.push(nodeIndex)
  }

  private async addMeshWithFaceTextures(
    box: Box3D,
    defaultMaterialIndex: number,
  ): Promise<void> {
    // Separate mesh triangles by face orientation
    const topTriangles: NonNullable<typeof box.mesh>["triangles"] = []
    const bottomTriangles: NonNullable<typeof box.mesh>["triangles"] = []
    const sideTriangles: NonNullable<typeof box.mesh>["triangles"] = []

    const yThreshold = 0.8 // Faces with normal Y > threshold are "top"

    for (const triangle of box.mesh!.triangles) {
      const ny = Math.abs(triangle.normal.y)
      if (ny > yThreshold) {
        if (triangle.normal.y > 0) {
          topTriangles.push(triangle)
        } else {
          bottomTriangles.push(triangle)
        }
      } else {
        sideTriangles.push(triangle)
      }
    }

    // Create materials
    const materials: {
      triangles: NonNullable<typeof box.mesh>["triangles"]
      materialIndex: number
    }[] = []

    // Top material with texture
    if (topTriangles.length > 0 && box.texture?.top) {
      const topMaterialIndex = this.addMaterial({
        name: `TopMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 1.0, 1.0, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.8,
        },
        alphaMode: "OPAQUE",
        doubleSided: true,
      })

      const textureIndex = await this.addTextureFromDataUrl(box.texture.top)
      if (textureIndex !== -1) {
        const material = this.materials[topMaterialIndex]!
        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.baseColorTexture = {
            index: textureIndex,
          }
        }
      }
      materials.push({
        triangles: topTriangles,
        materialIndex: topMaterialIndex,
      })
    }

    // Bottom material with texture
    if (bottomTriangles.length > 0 && box.texture?.bottom) {
      const bottomMaterialIndex = this.addMaterial({
        name: `BottomMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 1.0, 1.0, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.8,
        },
        alphaMode: "OPAQUE",
        doubleSided: true,
      })

      const textureIndex = await this.addTextureFromDataUrl(box.texture.bottom)
      if (textureIndex !== -1) {
        const material = this.materials[bottomMaterialIndex]!
        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.baseColorTexture = {
            index: textureIndex,
          }
        }
      }
      materials.push({
        triangles: bottomTriangles,
        materialIndex: bottomMaterialIndex,
      })
    }

    // Side material (green)
    if (sideTriangles.length > 0) {
      const sideMaterialIndex = this.addMaterial({
        name: `GreenSideMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [0.0, 0.55, 0.0, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.8,
        },
        alphaMode: "OPAQUE",
        doubleSided: true,
      })
      materials.push({
        triangles: sideTriangles,
        materialIndex: sideMaterialIndex,
      })
    }

    // Convert triangles to mesh data and create primitives
    const primitives: any[] = []
    const bounds = getBounds([]) // We'll calculate bounds from triangles

    // Calculate bounds from all triangles
    let minX = Infinity,
      minY = Infinity,
      minZ = Infinity
    let maxX = -Infinity,
      maxY = -Infinity,
      maxZ = -Infinity

    for (const triangle of box.mesh!.triangles) {
      for (const v of triangle.vertices) {
        minX = Math.min(minX, v.x)
        minY = Math.min(minY, v.y)
        minZ = Math.min(minZ, v.z)
        maxX = Math.max(maxX, v.x)
        maxY = Math.max(maxY, v.y)
        maxZ = Math.max(maxZ, v.z)
      }
    }

    const sizeX = maxX - minX
    const sizeZ = maxZ - minZ

    for (const { triangles, materialIndex } of materials) {
      const positions: number[] = []
      const normals: number[] = []
      const texcoords: number[] = []
      const indices: number[] = []
      let vertexIndex = 0

      for (const triangle of triangles) {
        for (const v of triangle.vertices) {
          positions.push(v.x, v.y, v.z)
          normals.push(triangle.normal.x, triangle.normal.y, triangle.normal.z)

          // Generate UV coordinates based on X/Z position for top/bottom faces
          const u = sizeX > 0 ? (v.x - minX) / sizeX : 0.5
          const v_coord = sizeZ > 0 ? (v.z - minZ) / sizeZ : 0.5
          texcoords.push(u, 1 - v_coord) // Flip V coordinate
        }

        indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2)
        vertexIndex += 3
      }

      const meshData: MeshData = { positions, normals, texcoords, indices }
      const transformedMeshData = transformMesh(
        meshData,
        box.center,
        box.rotation,
      )

      const positionAccessorIndex = this.addAccessor(
        transformedMeshData.positions,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER,
      )

      const normalAccessorIndex = this.addAccessor(
        transformedMeshData.normals,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER,
      )

      const texcoordAccessorIndex = this.addAccessor(
        transformedMeshData.texcoords,
        "VEC2",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER,
      )

      const indicesAccessorIndex = this.addAccessor(
        transformedMeshData.indices,
        "SCALAR",
        COMPONENT_TYPE.UNSIGNED_SHORT,
        TARGET.ELEMENT_ARRAY_BUFFER,
      )

      primitives.push({
        attributes: {
          POSITION: positionAccessorIndex,
          NORMAL: normalAccessorIndex,
          TEXCOORD_0: texcoordAccessorIndex,
        },
        indices: indicesAccessorIndex,
        material: materialIndex,
        mode: PRIMITIVE_MODE.TRIANGLES,
      })
    }

    // Create mesh with all primitives
    const meshIndex = this.meshes.length
    this.meshes.push({
      name: box.label || `MeshWithTextures${meshIndex}`,
      primitives,
    })

    // Create node
    const nodeIndex = this.nodes.length
    this.nodes.push({
      name: box.label || `Box${nodeIndex}`,
      mesh: meshIndex,
    })

    // Add node to scene
    this.gltf.scenes![0]!.nodes!.push(nodeIndex)
  }

  private async addBoxWithFaceMaterials(
    box: Box3D,
    defaultMaterialIndex: number,
  ): Promise<void> {
    // If we have a custom mesh (e.g., PCB with holes), use it
    if (box.mesh) {
      await this.addMeshWithFaceTextures(box, defaultMaterialIndex)
      return
    }

    // Create face-specific geometry for simple boxes
    const faceMeshes = createBoxMeshByFaces(box.size)

    // Create materials for each face
    const faceMaterials: Record<string, number> = {}

    // Top face - use texture if available
    if (box.texture?.top) {
      const topMaterialIndex = this.addMaterial({
        name: `TopMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 1.0, 1.0, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.8,
        },
        alphaMode: "OPAQUE",
      })

      const textureIndex = await this.addTextureFromDataUrl(box.texture.top)
      if (textureIndex !== -1) {
        const material = this.materials[topMaterialIndex]!
        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.baseColorTexture = {
            index: textureIndex,
          }
        }
      }
      faceMaterials.top = topMaterialIndex
    } else {
      faceMaterials.top = defaultMaterialIndex
    }

    // Bottom face - use texture if available
    if (box.texture?.bottom) {
      const bottomMaterialIndex = this.addMaterial({
        name: `BottomMaterial_${this.materials.length}`,
        pbrMetallicRoughness: {
          baseColorFactor: [1.0, 1.0, 1.0, 1.0],
          metallicFactor: 0.0,
          roughnessFactor: 0.8,
        },
        alphaMode: "OPAQUE",
      })

      const textureIndex = await this.addTextureFromDataUrl(box.texture.bottom)
      if (textureIndex !== -1) {
        const material = this.materials[bottomMaterialIndex]!
        if (material.pbrMetallicRoughness) {
          material.pbrMetallicRoughness.baseColorTexture = {
            index: textureIndex,
          }
        }
      }
      faceMaterials.bottom = bottomMaterialIndex
    } else {
      faceMaterials.bottom = defaultMaterialIndex
    }

    // Side faces - use green color
    const greenMaterialIndex = this.addMaterial({
      name: `GreenSideMaterial_${this.materials.length}`,
      pbrMetallicRoughness: {
        baseColorFactor: [0.0, 0.55, 0.0, 1.0], // Green color for PCB sides
        metallicFactor: 0.0,
        roughnessFactor: 0.8,
      },
      alphaMode: "OPAQUE",
    })
    faceMaterials.front = greenMaterialIndex
    faceMaterials.back = greenMaterialIndex
    faceMaterials.left = greenMaterialIndex
    faceMaterials.right = greenMaterialIndex

    // Create a single mesh with multiple primitives (one per face)
    const meshIndex = this.meshes.length
    const primitives: any[] = []

    for (const [faceName, faceData] of Object.entries(faceMeshes)) {
      // Apply transformations to each face
      const transformedFaceData = transformMesh(
        faceData,
        box.center,
        box.rotation,
      )

      // Create accessors for this face
      const positionAccessorIndex = this.addAccessor(
        transformedFaceData.positions,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER,
      )

      const normalAccessorIndex = this.addAccessor(
        transformedFaceData.normals,
        "VEC3",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER,
      )

      const texcoordAccessorIndex = this.addAccessor(
        transformedFaceData.texcoords,
        "VEC2",
        COMPONENT_TYPE.FLOAT,
        TARGET.ARRAY_BUFFER,
      )

      const indicesAccessorIndex = this.addAccessor(
        transformedFaceData.indices,
        "SCALAR",
        COMPONENT_TYPE.UNSIGNED_SHORT,
        TARGET.ELEMENT_ARRAY_BUFFER,
      )

      // Add primitive for this face
      primitives.push({
        attributes: {
          POSITION: positionAccessorIndex,
          NORMAL: normalAccessorIndex,
          TEXCOORD_0: texcoordAccessorIndex,
        },
        indices: indicesAccessorIndex,
        material: faceMaterials[faceName]!,
        mode: PRIMITIVE_MODE.TRIANGLES,
      })
    }

    // Create mesh with all face primitives
    this.meshes.push({
      name: box.label || `BoxMesh${meshIndex}`,
      primitives,
    })

    // Create node
    const nodeIndex = this.nodes.length
    this.nodes.push({
      name: box.label || `Box${nodeIndex}`,
      mesh: meshIndex,
    })

    // Add node to scene
    this.gltf.scenes![0]!.nodes!.push(nodeIndex)
  }

  private addMesh(
    meshData: MeshData,
    materialIndex: number,
    name?: string,
  ): number {
    const meshIndex = this.meshes.length

    // Create accessors for vertex data
    const positionAccessorIndex = this.addAccessor(
      meshData.positions,
      "VEC3",
      COMPONENT_TYPE.FLOAT,
      TARGET.ARRAY_BUFFER,
    )

    const normalAccessorIndex = this.addAccessor(
      meshData.normals,
      "VEC3",
      COMPONENT_TYPE.FLOAT,
      TARGET.ARRAY_BUFFER,
    )

    const texcoordAccessorIndex = this.addAccessor(
      meshData.texcoords,
      "VEC2",
      COMPONENT_TYPE.FLOAT,
      TARGET.ARRAY_BUFFER,
    )

    const indicesAccessorIndex = this.addAccessor(
      meshData.indices,
      "SCALAR",
      COMPONENT_TYPE.UNSIGNED_SHORT,
      TARGET.ELEMENT_ARRAY_BUFFER,
    )

    // Create mesh
    this.meshes.push({
      name: name || `Mesh${meshIndex}`,
      primitives: [
        {
          attributes: {
            POSITION: positionAccessorIndex,
            NORMAL: normalAccessorIndex,
            TEXCOORD_0: texcoordAccessorIndex,
          },
          indices: indicesAccessorIndex,
          material: materialIndex,
          mode: PRIMITIVE_MODE.TRIANGLES,
        },
      ],
    })

    return meshIndex
  }

  private addAccessor(
    data: number[],
    type: "SCALAR" | "VEC2" | "VEC3",
    componentType: number,
    target: number,
  ): number {
    const accessorIndex = this.accessors.length

    // Create buffer view
    const bufferViewIndex = this.bufferViews.length
    let byteOffset: number
    let byteLength: number

    if (componentType === COMPONENT_TYPE.FLOAT) {
      byteOffset = this.bufferBuilder.addFloat32Array(data)
      byteLength = data.length * 4
    } else if (componentType === COMPONENT_TYPE.UNSIGNED_SHORT) {
      byteOffset = this.bufferBuilder.addUint16Array(data)
      byteLength = data.length * 2
    } else {
      throw new Error(`Unsupported component type: ${componentType}`)
    }

    this.bufferViews.push({
      buffer: 0,
      byteOffset,
      byteLength,
      target,
    })

    // Calculate count based on type
    let count: number
    switch (type) {
      case "SCALAR":
        count = data.length
        break
      case "VEC2":
        count = data.length / 2
        break
      case "VEC3":
        count = data.length / 3
        break
      default:
        throw new Error(`Unsupported type: ${type}`)
    }

    // Calculate min/max for positions
    let min: number[] | undefined
    let max: number[] | undefined
    if (type === "VEC3" && target === TARGET.ARRAY_BUFFER) {
      const bounds = getBounds(data)
      min = [bounds.min.x, bounds.min.y, bounds.min.z]
      max = [bounds.max.x, bounds.max.y, bounds.max.z]
    }

    this.accessors.push({
      bufferView: bufferViewIndex,
      componentType,
      count,
      type,
      min,
      max,
    })

    return accessorIndex
  }

  private addMaterial(material: GLTFMaterial): number {
    const index = this.materials.length
    this.materials.push(material)
    return index
  }

  private addMaterialFromColor(color: Color, makeTransparent = false): number {
    const baseColor: [number, number, number, number] =
      typeof color === "string"
        ? this.parseColorString(color)
        : [color[0] / 255, color[1] / 255, color[2] / 255, color[3]]

    // Make components without models 50% transparent
    if (makeTransparent) {
      baseColor[3] = 0.5
    }

    return this.addMaterial({
      name: `Material_${this.materials.length}`,
      pbrMetallicRoughness: {
        baseColorFactor: baseColor,
        metallicFactor: 0.05,
        roughnessFactor: 0.95,
      },
      alphaMode: makeTransparent ? "BLEND" : "OPAQUE",
    })
  }

  private parseColorString(color: string): [number, number, number, number] {
    // Simple color parsing - could be expanded
    if (color.startsWith("#")) {
      const hex = color.slice(1)
      const r = parseInt(hex.slice(0, 2), 16) / 255
      const g = parseInt(hex.slice(2, 4), 16) / 255
      const b = parseInt(hex.slice(4, 6), 16) / 255
      const a = hex.length > 6 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
      return [r, g, b, a]
    } else if (color.startsWith("rgba(")) {
      const match = color.match(/rgba\(([^)]+)\)/)
      if (match) {
        const parts = match[1]!.split(",").map((s) => s.trim())
        return [
          parseFloat(parts[0]!) / 255,
          parseFloat(parts[1]!) / 255,
          parseFloat(parts[2]!) / 255,
          parseFloat(parts[3]!),
        ]
      }
    } else if (color.startsWith("rgb(")) {
      const match = color.match(/rgb\(([^)]+)\)/)
      if (match) {
        const parts = match[1]!.split(",").map((s) => s.trim())
        return [
          parseFloat(parts[0]!) / 255,
          parseFloat(parts[1]!) / 255,
          parseFloat(parts[2]!) / 255,
          1,
        ]
      }
    }

    // Default colors
    const namedColors: Record<string, [number, number, number, number]> = {
      white: [1, 1, 1, 1],
      black: [0, 0, 0, 1],
      red: [1, 0, 0, 1],
      green: [0, 1, 0, 1],
      blue: [0, 0, 1, 1],
      gray: [0.5, 0.5, 0.5, 1],
      grey: [0.5, 0.5, 0.5, 1],
    }

    return namedColors[color.toLowerCase()] || [0.5, 0.5, 0.5, 1]
  }

  private async addTextureFromDataUrl(dataUrl: string): Promise<number> {
    try {
      // Extract image data from data URL
      const base64Match = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/)
      if (!base64Match) {
        console.warn("Invalid data URL format")
        return -1
      }

      const mimeType = `image/${base64Match[1]!}`
      const base64Data = base64Match[2]!
      const imageData = Uint8Array.from(atob(base64Data), (c) =>
        c.charCodeAt(0),
      )

      // Store image data for later embedding
      const imageIndex = this.images.length
      this.imageDataMap.set(`image${imageIndex}`, imageData)

      // Add image
      this.images.push({
        mimeType,
        bufferView: -1, // Will be set when finalizing
      })

      // Add texture
      const textureIndex = this.textures.length
      this.textures.push({
        source: imageIndex,
        sampler: 0, // Use default sampler
      })

      return textureIndex
    } catch (error) {
      console.warn("Failed to add texture:", error)
      return -1
    }
  }

  export(binary = false): ArrayBuffer | object {
    // Finalize the GLTF structure
    this.gltf.nodes = this.nodes
    this.gltf.meshes = this.meshes
    this.gltf.materials = this.materials
    this.gltf.accessors = this.accessors
    this.gltf.bufferViews = this.bufferViews

    // Add images and textures if any
    if (this.images.length > 0) {
      // Add image data to buffer and update buffer views
      for (let i = 0; i < this.images.length; i++) {
        const imageData = this.imageDataMap.get(`image${i}`)
        if (imageData) {
          const byteOffset = this.bufferBuilder.addBytes(imageData)
          const bufferViewIndex = this.bufferViews.length
          this.bufferViews.push({
            buffer: 0,
            byteOffset,
            byteLength: imageData.length,
          })
          this.images[i]!.bufferView = bufferViewIndex
        }
      }

      this.gltf.images = this.images
      this.gltf.textures = this.textures

      // Add default sampler
      this.gltf.samplers = [
        {
          magFilter: FILTER.LINEAR,
          minFilter: FILTER.LINEAR_MIPMAP_LINEAR,
          wrapS: WRAP.REPEAT,
          wrapT: WRAP.REPEAT,
        },
      ]
    }

    // Get final buffer
    const bufferData = this.bufferBuilder.getBuffer()

    if (binary) {
      // Create GLB
      return this.createGLB(this.gltf, bufferData)
    } else {
      // Create GLTF with embedded buffer
      this.gltf.buffers = [
        {
          byteLength: bufferData.byteLength,
          uri: `data:application/octet-stream;base64,${this.arrayBufferToBase64(
            bufferData,
          )}`,
        },
      ]
      return this.gltf
    }
  }

  private createGLB(gltf: GLTF, bufferData: ArrayBuffer): ArrayBuffer {
    // GLB format:
    // 12-byte header
    // JSON chunk
    // Binary chunk

    // For GLB format, we need to add a buffer reference to the embedded binary data
    const gltfWithBuffer = {
      ...gltf,
      buffers: [
        {
          byteLength: bufferData.byteLength,
        },
      ],
    }

    const jsonString = JSON.stringify(gltfWithBuffer)
    const jsonData = new TextEncoder().encode(jsonString)

    // Pad JSON to 4-byte alignment
    const jsonPadding = (4 - (jsonData.length % 4)) % 4
    const jsonLength = jsonData.length + jsonPadding

    // Pad binary to 4-byte alignment
    const binPadding = (4 - (bufferData.byteLength % 4)) % 4
    const binLength = bufferData.byteLength + binPadding

    // Calculate total size
    const totalSize = 12 + 8 + jsonLength + 8 + binLength

    // Create GLB buffer
    const glb = new ArrayBuffer(totalSize)
    const view = new DataView(glb)

    // Header
    view.setUint32(0, 0x46546c67, true) // magic "glTF"
    view.setUint32(4, 2, true) // version
    view.setUint32(8, totalSize, true) // length

    // JSON chunk
    view.setUint32(12, jsonLength, true) // chunk length
    view.setUint32(16, 0x4e4f534a, true) // chunk type "JSON"

    // Copy JSON data and pad with spaces
    const jsonArray = new Uint8Array(glb, 20, jsonLength)
    jsonArray.set(jsonData)
    // Fill padding bytes with spaces (0x20) as required by GLB spec
    for (let i = jsonData.length; i < jsonLength; i++) {
      jsonArray[i] = 0x20
    }

    // Binary chunk
    const binChunkOffset = 20 + jsonLength
    view.setUint32(binChunkOffset, binLength, true) // chunk length
    view.setUint32(binChunkOffset + 4, 0x004e4942, true) // chunk type "BIN\0"

    // Copy binary data
    const binArray = new Uint8Array(
      glb,
      binChunkOffset + 8,
      bufferData.byteLength,
    )
    binArray.set(new Uint8Array(bufferData))

    return glb
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]!)
    }
    return btoa(binary)
  }
}
