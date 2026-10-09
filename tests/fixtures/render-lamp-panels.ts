import { createCanvas, loadImage } from "@napi-rs/canvas"
import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"

/** Cameras are points in exported glTF world: +Y up, millimeters. This uses
 * the same real GLB -> PoppyGL path as three-disc-flex-four-view.test.ts.
 */
export async function renderLampPanels(
  panels: {
    label: string
    circuitJson: CircuitJson
    showReferenceSurfaces?: boolean
    camPos?: [number, number, number]
    lookAt?: [number, number, number]
  }[],
) {
  const width = 600
  const height = 540
  const headingHeight = 40
  const canvas = createCanvas(width * 2, height * Math.ceil(panels.length / 2))
  const context = canvas.getContext("2d")
  context.fillStyle = "#f2f3f5"
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (const [index, panel] of panels.entries()) {
    const glb = (await convertCircuitJsonToGltf(panel.circuitJson, {
      format: "glb",
      showReferenceSurfaces: panel.showReferenceSurfaces,
    })) as ArrayBuffer
    const png = await renderGLTFToPNGFromGLB(glb, {
      width,
      height: height - headingHeight,
      camPos: panel.camPos ?? [184, 120, 219],
      lookAt: panel.lookAt ?? [0, 86, 0],
      up: "y+",
      fov: 40,
      grid: false,
      backgroundColor: "#f2f3f5",
      ambient: 0.45,
    })
    const x = (index % 2) * width
    const y = Math.floor(index / 2) * height
    context.drawImage(await loadImage(png), x, y + headingHeight)
    context.fillStyle = "#28323c"
    context.font = "18px sans-serif"
    context.fillText(panel.label, x + 20, y + 27)
  }
  return canvas.toBuffer("image/png")
}
