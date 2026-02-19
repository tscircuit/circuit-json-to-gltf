import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D } from "./converters/circuit-to-3d"
import { convertSceneToGLTF } from "./converters/scene-to-gltf"
import type { ConversionOptions } from "./types"

export async function convertCircuitJsonToGltf(
  circuitJson: CircuitJson,
  options: ConversionOptions = {},
): Promise<ArrayBuffer | object> {
  const {
    format = "gltf",
    boardTextureResolution = 1024,
    drawFauxBoard = false,
    includeModels = true,
    modelCache,
    backgroundColor,
    showBoundingBoxes = false,
  } = options

  // Convert circuit JSON to 3D scene
  const scene3D = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: true,
    textureResolution: boardTextureResolution,
    drawFauxBoard,
    coordinateTransform: options.coordinateTransform,
    showBoundingBoxes,
    projectBaseUrl: options.projectBaseUrl,
    authHeaders: options.authHeaders,
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

export {
  renderBoardLayer,
  renderBoardTextures,
} from "./converters/board-renderer"
// Re-export converters
export { convertCircuitJsonTo3D } from "./converters/circuit-to-3d"
export { convertSceneToGLTF } from "./converters/scene-to-gltf"
export { clearGLBCache, loadGLB } from "./loaders/glb"
export { clearOBJCache, loadOBJ } from "./loaders/obj"
// Re-export loaders
export { clearSTLCache, loadSTL } from "./loaders/stl"
// Re-export types
export type {
  BoardRenderOptions,
  BoundingBox,
  Box3D,
  Camera3D,
  CircuitTo3DOptions,
  Color,
  ConversionOptions,
  CoordinateTransformConfig,
  GLTFExportOptions,
  Light3D,
  OBJMaterial,
  OBJMesh,
  Point3,
  Scene3D,
  Size3,
  STLMesh,
  Triangle,
} from "./types"

// Re-export coordinate transform utilities
export {
  applyCoordinateTransform,
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "./utils/coordinate-transform"

export {
  getBestCameraPosition,
  type CameraFitOptions,
} from "./utils/camera-position"

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
