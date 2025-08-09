import type { CircuitJson } from "circuit-json"

export interface ConversionOptions {
  format?: "gltf" | "glb"
  boardTextureResolution?: number
  includeModels?: boolean
  modelCache?: Map<string, STLMesh | OBJMesh>
  backgroundColor?: string
  showBoundingBoxes?: boolean
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
}

export interface OBJMaterial {
  name: string
  color?: Color
  ambient?: Color
  specular?: Color
  shininess?: number
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
  meshType?: "stl" | "obj"
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
