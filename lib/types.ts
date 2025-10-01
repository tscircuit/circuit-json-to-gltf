import type { CircuitJson } from "circuit-json"

export interface ConversionOptions {
  format?: "gltf" | "glb"
  boardTextureResolution?: number
  includeModels?: boolean
  modelCache?: Map<string, STLMesh | OBJMesh>
  backgroundColor?: string
  showBoundingBoxes?: boolean
  coordinateTransform?: CoordinateTransformConfig
}

export interface CoordinateTransformConfig {
  // Flip axes: -1 to flip, 1 to keep original
  flipX?: number
  flipY?: number
  flipZ?: number
  // Axis remapping: which original axis becomes which final axis
  // e.g., { x: "y", y: "z", z: "x" } swaps all axes
  axisMapping?: {
    x?: "x" | "y" | "z" | "-x" | "-y" | "-z"
    y?: "x" | "y" | "z" | "-x" | "-y" | "-z"
    z?: "x" | "y" | "z" | "-x" | "-y" | "-z"
  }
  // Additional rotation in degrees around each axis (applied after axis mapping)
  rotation?: {
    x?: number
    y?: number
    z?: number
  }
}

export interface Point3 {
  x: number
  y: number
  z: number
}

export interface Size3 {
  x: number
  y: number
  z: number
}

export interface Triangle {
  vertices: [Point3, Point3, Point3]
  normal: Point3
  color?: Color
  materialIndex?: number
}

export interface BoundingBox {
  min: Point3
  max: Point3
}

export interface STLMesh {
  triangles: Triangle[]
  boundingBox: BoundingBox
}

export interface OBJMesh extends STLMesh {
  materials?: Map<string, OBJMaterial>
  materialIndexMap?: Map<string, number>
}

export interface OBJMaterial {
  name: string
  color?: Color
  ambient?: Color
  specular?: Color
  shininess?: number
  dissolve?: number
}

export type Color = string | [number, number, number, number]

export interface Box3D {
  center: Point3
  size: Size3
  rotation?: Point3
  color?: Color
  texture?: {
    top?: string
    bottom?: string
    front?: string
    back?: string
    left?: string
    right?: string
  }
  mesh?: STLMesh | OBJMesh
  meshUrl?: string
  meshType?: "stl" | "obj" | "glb"
  label?: string
  labelColor?: Color
}

export interface Scene3D {
  boxes: Box3D[]
  camera?: Camera3D
  lights?: Light3D[]
}

export interface Camera3D {
  position: Point3
  target: Point3
  up?: Point3
  fov?: number
  near?: number
  far?: number
}

export interface Light3D {
  type: "ambient" | "directional" | "point"
  color?: Color
  intensity?: number
  position?: Point3
  direction?: Point3
}

export interface GLTFExportOptions {
  binary?: boolean
  trs?: boolean
  onlyVisible?: boolean
  truncateDrawRange?: boolean
  embedImages?: boolean
  animations?: any[]
  forceIndices?: boolean
  includeCustomExtensions?: boolean
}

export interface CircuitTo3DOptions {
  pcbColor?: Color
  componentColor?: Color
  boardThickness?: number
  defaultComponentHeight?: number
  renderBoardTextures?: boolean
  textureResolution?: number
  coordinateTransform?: CoordinateTransformConfig
}

export interface BoardRenderOptions {
  layer: "top" | "bottom"
  resolution?: number
  backgroundColor?: string
  copperColor?: string
  silkscreenColor?: string
  padColor?: string
  drillColor?: string
}
