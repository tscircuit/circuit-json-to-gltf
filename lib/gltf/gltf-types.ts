// GLTF 2.0 specification types
// https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html

export interface GLTF {
  asset: {
    version: string
    generator?: string
  }
  scene?: number
  scenes?: GLTFScene[]
  nodes?: GLTFNode[]
  meshes?: GLTFMesh[]
  buffers?: GLTFBuffer[]
  bufferViews?: GLTFBufferView[]
  accessors?: GLTFAccessor[]
  materials?: GLTFMaterial[]
  textures?: GLTFTexture[]
  images?: GLTFImage[]
  samplers?: GLTFSampler[]
}

export interface GLTFScene {
  name?: string
  nodes?: number[]
}

export interface GLTFNode {
  name?: string
  mesh?: number
  translation?: [number, number, number]
  rotation?: [number, number, number, number]
  scale?: [number, number, number]
  matrix?: number[]
  children?: number[]
}

export interface GLTFMesh {
  name?: string
  primitives: GLTFPrimitive[]
}

export interface GLTFPrimitive {
  attributes: {
    POSITION: number
    NORMAL?: number
    TEXCOORD_0?: number
    COLOR_0?: number
  }
  indices?: number
  material?: number
  mode?: number // 4 = TRIANGLES (default)
}

export interface GLTFBuffer {
  uri?: string
  byteLength: number
}

export interface GLTFBufferView {
  buffer: number
  byteOffset?: number
  byteLength: number
  byteStride?: number
  target?: number // 34962 = ARRAY_BUFFER, 34963 = ELEMENT_ARRAY_BUFFER
}

export interface GLTFAccessor {
  bufferView?: number
  byteOffset?: number
  componentType: number // 5126 = FLOAT, 5123 = UNSIGNED_SHORT
  normalized?: boolean
  count: number
  type: "SCALAR" | "VEC2" | "VEC3" | "VEC4" | "MAT2" | "MAT3" | "MAT4"
  max?: number[]
  min?: number[]
}

export interface GLTFMaterial {
  name?: string
  pbrMetallicRoughness?: {
    baseColorFactor?: [number, number, number, number]
    baseColorTexture?: {
      index: number
      texCoord?: number
    }
    metallicFactor?: number
    roughnessFactor?: number
  }
  normalTexture?: {
    index: number
    texCoord?: number
    scale?: number
  }
  occlusionTexture?: {
    index: number
    texCoord?: number
    strength?: number
  }
  emissiveTexture?: {
    index: number
    texCoord?: number
  }
  emissiveFactor?: [number, number, number]
  alphaMode?: "OPAQUE" | "MASK" | "BLEND"
  alphaCutoff?: number
  doubleSided?: boolean
}

export interface GLTFTexture {
  sampler?: number
  source?: number
}

export interface GLTFImage {
  uri?: string
  mimeType?: string
  bufferView?: number
}

export interface GLTFSampler {
  magFilter?: number
  minFilter?: number
  wrapS?: number
  wrapT?: number
}

// Component type constants
export const COMPONENT_TYPE = {
  BYTE: 5120,
  UNSIGNED_BYTE: 5121,
  SHORT: 5122,
  UNSIGNED_SHORT: 5123,
  UNSIGNED_INT: 5125,
  FLOAT: 5126,
}

// Target constants
export const TARGET = {
  ARRAY_BUFFER: 34962,
  ELEMENT_ARRAY_BUFFER: 34963,
}

// Primitive mode constants
export const PRIMITIVE_MODE = {
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6,
}

// Filter constants
export const FILTER = {
  NEAREST: 9728,
  LINEAR: 9729,
  NEAREST_MIPMAP_NEAREST: 9984,
  LINEAR_MIPMAP_NEAREST: 9985,
  NEAREST_MIPMAP_LINEAR: 9986,
  LINEAR_MIPMAP_LINEAR: 9987,
}

// Wrap mode constants
export const WRAP = {
  CLAMP_TO_EDGE: 33071,
  MIRRORED_REPEAT: 33648,
  REPEAT: 10497,
}