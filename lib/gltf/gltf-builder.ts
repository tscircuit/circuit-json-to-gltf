import type { Scene3D, Box3D, Color } from "../types"
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
        baseColorFactor: [0.5, 0.5, 0.5, 1.0],
        metallicFactor: 0.1,
        roughnessFactor: 0.8,
      },
      alphaMode: "OPAQUE",
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
      materialIndex = this.addMaterialFromColor(box.color)
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
    this.gltf.scenes![0].nodes!.push(nodeIndex)
  }

  private async addBoxWithFaceMaterials(
    box: Box3D,
    defaultMaterialIndex: number,
  ): Promise<void> {
    // Create face-specific geometry
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
        const material = this.materials[topMaterialIndex]
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
        const material = this.materials[bottomMaterialIndex]
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
      const transformedFaceData = transformMesh(faceData, box.center, box.rotation)
      
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
        material: faceMaterials[faceName],
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
    this.gltf.scenes![0].nodes!.push(nodeIndex)
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

  private addMaterialFromColor(color: Color): number {
    const baseColor: [number, number, number, number] =
      typeof color === "string"
        ? this.parseColorString(color)
        : [color[0] / 255, color[1] / 255, color[2] / 255, color[3]]

    return this.addMaterial({
      name: `Material_${this.materials.length}`,
      pbrMetallicRoughness: {
        baseColorFactor: baseColor,
        metallicFactor: 0.1,
        roughnessFactor: 0.8,
      },
      alphaMode: "OPAQUE",
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
        const parts = match[1].split(",").map((s) => s.trim())
        return [
          parseFloat(parts[0]) / 255,
          parseFloat(parts[1]) / 255,
          parseFloat(parts[2]) / 255,
          parseFloat(parts[3]),
        ]
      }
    } else if (color.startsWith("rgb(")) {
      const match = color.match(/rgb\(([^)]+)\)/)
      if (match) {
        const parts = match[1].split(",").map((s) => s.trim())
        return [
          parseFloat(parts[0]) / 255,
          parseFloat(parts[1]) / 255,
          parseFloat(parts[2]) / 255,
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

      const mimeType = `image/${base64Match[1]}`
      const base64Data = base64Match[2]
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
          this.images[i].bufferView = bufferViewIndex
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

    const jsonString = JSON.stringify(gltf)
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

    // Copy JSON data
    const jsonArray = new Uint8Array(glb, 20, jsonData.length)
    jsonArray.set(jsonData)

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
      binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
  }
}
