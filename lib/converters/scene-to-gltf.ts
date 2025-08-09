import type { Scene3D, GLTFExportOptions } from "../types"
import { GLTFBuilder } from "../gltf/gltf-builder"

export async function convertSceneToGLTF(
  scene: Scene3D,
  options: GLTFExportOptions = {}
): Promise<ArrayBuffer | object> {
  const builder = new GLTFBuilder()
  
  // Build the GLTF from our Scene3D structure
  await builder.buildFromScene3D(scene)
  
  // Export to GLTF
  const result = builder.export(options.binary)
  
  return result
}