import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { renderGLTFToPNGFromGLB, type RenderOptionsInput } from "poppygl"
import { createThreeDiscFlex } from "../../examples/three-disc-flex"
import { convertCircuitJsonToGltf } from "../../lib"

// Cameras use exported glTF coordinates: +Y up, millimeters. Explicit axis
// labels avoid the conflicting front/back conventions used by other viewers.
const views: { label: string; camera: RenderOptionsInput }[] = [
  { label: "Isometric", camera: { camPos: [22, 22, 28], up: "y+" } },
  { label: "Side · looking from +Z", camera: { camPos: [0, 6, 38], up: "y+" } },
  { label: "End · looking from +X", camera: { camPos: [38, 6, 0], up: "y+" } },
  { label: "Top · looking from +Y", camera: { camPos: [0, 44, 0], up: "z-" } },
]

test("folded three-disc flex PCB from four views", async () => {
  const glb = (await convertCircuitJsonToGltf(createThreeDiscFlex(), {
    format: "glb",
    foldPcbs: true,
    boardTextureResolution: 1024,
  })) as ArrayBuffer

  const tileWidth = 600
  const tileHeight = 500
  const headingHeight = 36
  const canvas = createCanvas(tileWidth * 2, tileHeight * 2)
  const context = canvas.getContext("2d")
  context.fillStyle = "#f2f3f5"
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (const [index, view] of views.entries()) {
    const png = await renderGLTFToPNGFromGLB(glb, {
      width: tileWidth,
      height: tileHeight - headingHeight,
      backgroundColor: "#f2f3f5",
      ambient: 0.45,
      fov: 35,
      lookAt: [0, 6, 0],
      ...view.camera,
    })
    const x = (index % 2) * tileWidth
    const y = Math.floor(index / 2) * tileHeight
    context.drawImage(await loadImage(png), x, y + headingHeight)
    context.fillStyle = "#28323c"
    context.font = "18px sans-serif"
    context.fillText(view.label, x + 20, y + 25)
  }

  context.strokeStyle = "#d6dadd"
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(tileWidth, 0)
  context.lineTo(tileWidth, canvas.height)
  context.moveTo(0, tileHeight)
  context.lineTo(canvas.width, tileHeight)
  context.stroke()

  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
    "three-disc-flex-four-view",
  )
})
