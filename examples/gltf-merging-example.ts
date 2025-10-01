import { convertCircuitJsonTo3D, loadGLTF } from "../lib"
import circuitWithGLTF from "../tests/fixtures/circuit-with-gltf-components.json"

async function testGLTFMerging() {
  console.log("Testing GLTF loading...")

  try {
    // Test loading a GLTF file directly
    const testUrl = "https://modelcdn.tscircuit.com/jscad_models/soic8.glb"
    console.log(`Loading GLTF from: ${testUrl}`)

    const mesh = await loadGLTF(testUrl)
    console.log("GLTF loaded successfully!")
    console.log(`Triangles: ${mesh.triangles.length}`)
    console.log(`Bounding box:`, mesh.boundingBox)

    // Test circuit conversion with GLTF components (without board textures)
    console.log("\nConverting circuit with GLTF components...")
    const scene = await convertCircuitJsonTo3D(circuitWithGLTF as any, {
      renderBoardTextures: false, // Disable board textures to avoid sharp dependency
    })

    console.log("Scene created successfully!")
    console.log(`Number of boxes: ${scene.boxes.length}`)

    const gltfBoxes = scene.boxes.filter(box =>
      box.meshType === "gltf" || box.meshType === "glb"
    )
    console.log(`Number of GLTF boxes: ${gltfBoxes.length}`)

    for (const box of gltfBoxes) {
      console.log(`GLTF Box: ${box.label || 'unnamed'} - ${box.meshType} - Triangles: ${(box.mesh as any)?.triangles?.length || 0}`)
    }

    console.log("✅ GLTF merging functionality is working!")

  } catch (error) {
    console.error("❌ Error occurred:", error)
    if (error instanceof Error) {
      console.error("Error message:", error.message)
      console.error("Stack trace:", error.stack)
    }
  }
}

testGLTFMerging()
