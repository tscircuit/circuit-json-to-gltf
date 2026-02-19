// Browser-safe exports that don't include Node.js dependencies
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D as originalConvertCircuitJsonTo3D } from "./converters/circuit-to-3d"
import { convertSceneToGLTF } from "./converters/scene-to-gltf"
import type { ConversionOptions } from "./types"

export { clearOBJCache, loadOBJ } from "./loaders/obj"

// Re-export loaders (these should work in browser)
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

export {
  getBestCameraPosition,
  type CameraFitOptions,
} from "./utils/camera-position"

// Override the board renderer import
const mockBoardRenderer = {
  renderBoardLayer: async () => "",
  renderBoardTextures: async () => ({ top: "", bottom: "" }),
}

// Monkey-patch the module resolution
if (typeof window !== "undefined") {
  ;(globalThis as any).__circuit_json_to_gltf_board_renderer = mockBoardRenderer
}

// Wrapper for circuit to 3D conversion
export async function convertCircuitJsonTo3D(
  circuitJson: CircuitJson,
  options: any = {},
) {
  // Always disable textures in browser for now
  return originalConvertCircuitJsonTo3D(circuitJson, {
    ...options,
    renderBoardTextures: false,
    textureResolution: 0,
  })
}

// Main conversion function
export async function convertCircuitJsonToGltf(
  circuitJson: CircuitJson,
  options: ConversionOptions = {},
): Promise<ArrayBuffer | object> {
  const { format = "gltf" } = options

  // Convert circuit JSON to 3D scene (without textures)
  const scene3D = await convertCircuitJsonTo3D(circuitJson, {
    ...options,
    renderBoardTextures: false,
    textureResolution: 0,
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

export { convertSceneToGLTF }
