import type { CircuitJson } from "circuit-json"
import type { ConversionOptions } from "./types"
import { convertCircuitJsonTo3D } from "./converters/circuit-to-3d"
import { convertSceneToGLTF } from "./converters/scene-to-gltf"

export async function convertCircuitJsonToGltf(
  circuitJson: CircuitJson,
  options: ConversionOptions = {},
): Promise<ArrayBuffer | object> {
  const {
    format = "gltf",
    boardTextureResolution = 1024,
    includeModels = true,
    modelCache,
    backgroundColor,
    showBoundingBoxes = false,
  } = options

  // Convert circuit JSON to 3D scene
  const scene3D = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: true,
    textureResolution: boardTextureResolution,
    coordinateTransform: options.coordinateTransform,
    showBoundingBoxes,
  })

  // Convert 3D scene to GLTF
  const gltfOptions = {
    binary: format === "glb",
    embedImages: true,
    forceIndices: true,
  }

  const result = await convertSceneToGLTF(scene3D, gltfOptions)

  return result
}

// Re-export types
export type {
  ConversionOptions,
  Point3,
  Size3,
  Triangle,
  BoundingBox,
  STLMesh,
  OBJMesh,
  OBJMaterial,
  Color,
  Box3D,
  Scene3D,
  Camera3D,
  Light3D,
  GLTFExportOptions,
  CircuitTo3DOptions,
  BoardRenderOptions,
  CoordinateTransformConfig,
} from "./types"

// Re-export loaders
export { loadSTL, clearSTLCache } from "./loaders/stl"
export { loadOBJ, clearOBJCache } from "./loaders/obj"
export { loadGLB, clearGLBCache } from "./loaders/glb"

// Re-export converters
export { convertCircuitJsonTo3D } from "./converters/circuit-to-3d"
export { convertSceneToGLTF } from "./converters/scene-to-gltf"
export {
  renderBoardLayer,
  renderBoardTextures,
} from "./converters/board-renderer"

// Re-export coordinate transform utilities
export {
  COORDINATE_TRANSFORMS,
  applyCoordinateTransform,
  transformTriangles,
} from "./utils/coordinate-transform"

// Re-export utilities (conditionally based on environment)
// Note: svg-to-png utilities are environment-specific and not exported here

export interface Point {
  x: number
  y: number
}

export type LayerRef = string | number

export interface BRepShape {
  polygons: Point[][]
  is_negative?: boolean
}
