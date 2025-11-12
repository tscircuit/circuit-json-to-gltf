import { convertCircuitJsonToGltf } from "../lib"
import { writeFile } from "fs/promises"
import { join } from "path"

const circuitJson = [
  {
    type: "pcb_panel",
    pcb_panel_id: "panel_0",
    width: 100,
    height: 100,
  },
  {
    type: "pcb_board",
    pcb_board_id: "board_0",
    center: { x: -25, y: 25 },
    width: 40,
    height: 40,
    thickness: 1.6,
    material: "fr4",
    num_layers: 2,
  },
  {
    type: "pcb_board",
    pcb_board_id: "board_1",
    center: { x: 25, y: 25 },
    width: 40,
    height: 40,
    thickness: 1.6,
    material: "fr4",
    num_layers: 2,
  },
  {
    type: "pcb_board",
    pcb_board_id: "board_2",
    center: { x: -25, y: -25 },
    width: 40,
    height: 40,
    thickness: 1.6,
    material: "fr4",
    num_layers: 2,
  },
  {
    type: "pcb_board",
    pcb_board_id: "board_3",
    center: { x: 25, y: -25 },
    width: 40,
    height: 40,
    thickness: 1.6,
    material: "fr4",
    num_layers: 2,
  },
]

async function main() {
  try {
    console.log("Converting PCB panel circuit JSON to GLTF...")

    const gltf = await convertCircuitJsonToGltf(circuitJson as any, {
      format: "gltf",
      boardTextureResolution: 1024,
    })

    await writeFile(
      join(__dirname, "panel.gltf"),
      JSON.stringify(gltf, null, 2),
    )
    console.log("Saved panel.gltf")

    const glb = await convertCircuitJsonToGltf(circuitJson as any, {
      format: "glb",
      boardTextureResolution: 1024,
    })

    await writeFile(
      join(__dirname, "panel.glb"),
      Buffer.from(glb as ArrayBuffer),
    )
    console.log("Saved panel.glb")
  } catch (error) {
    console.error("Error converting panel circuit:", error)
  }
}

if (import.meta.main) {
  main()
}
