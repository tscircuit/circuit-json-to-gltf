import { convertCircuitJsonToGltf } from "../lib"
import { writeFile } from "fs/promises"
import { join } from "path"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { getBestCameraPosition } from "../lib/utils/camera-position"

const circuitJson = [
  {
    type: "pcb_panel",
    pcb_panel_id: "panel_0",
    width: 100,
    height: 100,
    covered_with_solder_mask: true,
  },
  {
    type: "pcb_board",
    pcb_board_id: "board_0",
    pcb_panel_id: "panel_0",
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
    pcb_panel_id: "panel_0",
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
    pcb_panel_id: "panel_0",
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
    pcb_panel_id: "panel_0",
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

    const cameraOptions = getBestCameraPosition(circuitJson as any)
    const panelThickness = (
      circuitJson.find((item) => item.type === "pcb_board") as
        | { thickness?: number }
        | undefined
    )?.thickness

    const pngBuffer = await renderGLTFToPNGBufferFromGLBBuffer(
      glb as ArrayBuffer,
      {
        ...cameraOptions,
        backgroundColor: [1, 1, 1],
        grid: {
          infiniteGrid: true,
          cellSize: 5,
          sectionSize: 25,
          fadeDistance: 120,
          fadeStrength: 1.2,
          gridColor: [0.88, 0.88, 0.88],
          sectionColor: [0.7, 0.7, 0.95],
          offset: {
            y: -((panelThickness ?? 1.6) / 2) - 0.05,
          },
        },
      },
    )

    await writeFile(join(__dirname, "panel.png"), pngBuffer)
    console.log("Saved panel.png")
  } catch (error) {
    console.error("Error converting panel circuit:", error)
  }
}

if (import.meta.main) {
  main()
}
