import { convertCircuitJsonToGltf } from "../lib"
import { writeFile } from "fs/promises"
import { join } from "path"

// Example circuit JSON with a PCB board and some components
const circuitJson = [
  {
    type: "pcb_board",
    pcb_board_id: "board1",
    center: { x: 0, y: 0 },
    width: 80,
    height: 60,
    thickness: 1.6,
  },
  {
    type: "pcb_component",
    pcb_component_id: "comp1",
    source_component_id: "src1",
    center: { x: -20, y: -10 },
    width: 12,
    height: 8,
    layer: "top",
  },
  {
    type: "pcb_component",
    pcb_component_id: "comp2",
    source_component_id: "src2",
    center: { x: 20, y: 10 },
    width: 15,
    height: 15,
    layer: "top",
  },
  {
    type: "source_component",
    source_component_id: "src1",
    name: "R1",
    display_value: "10kΩ",
  },
  {
    type: "source_component",
    source_component_id: "src2",
    name: "U1",
    display_value: "ESP32",
  },
  // Example with 3D model
  {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "comp2",
    model_stl_url: "https://example.com/esp32.stl", // Replace with actual URL
    position: { x: 20, y: 10, z: 2 },
    rotation: { x: 0, y: 0, z: 90 },
  },
]

async function main() {
  try {
    console.log("Converting circuit JSON to GLTF...")

    // Convert to GLTF (JSON format)
    const gltf = await convertCircuitJsonToGltf(circuitJson as any, {
      format: "gltf",
      boardTextureResolution: 2048,
    })

    // Save GLTF file
    await writeFile(
      join(__dirname, "output.gltf"),
      JSON.stringify(gltf, null, 2),
    )
    console.log("Saved output.gltf")

    // Convert to GLB (binary format)
    const glb = await convertCircuitJsonToGltf(circuitJson as any, {
      format: "glb",
      boardTextureResolution: 2048,
    })

    // Save GLB file
    await writeFile(
      join(__dirname, "output.glb"),
      Buffer.from(glb as ArrayBuffer),
    )
    console.log("Saved output.glb")

    console.log("Conversion complete!")
  } catch (error) {
    console.error("Error converting circuit:", error)
  }
}

if (import.meta.main) {
  main()
}
