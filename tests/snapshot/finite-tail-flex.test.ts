import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { transformCircuitJsonCadComponents } from "@tscircuit/flex-utils"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import { createFiniteTailFlex } from "../fixtures/finite-tail-flex"

test("GLB export folds only RL's tail, with flat and pre-folded CAD input", async () => {
  const flat = createFiniteTailFlex()
  const folded = transformCircuitJsonCadComponents(flat, { foldPcbs: true })
  const tileWidth = 720
  const tileHeight = 600
  const headingHeight = 36
  const canvas = createCanvas(tileWidth * 2, tileHeight)
  const context = canvas.getContext("2d")
  context.fillStyle = "#f2f3f5"
  context.fillRect(0, 0, canvas.width, canvas.height)

  for (const [index, input] of [flat, folded].entries()) {
    // Automatic pose follows the CAD fold flag, using the real GLB exporter.
    const glb = await convertCircuitJsonToGltf(input, {
      format: "glb",
      boardTextureResolution: 1024,
    })
    expect(glb).toBeInstanceOf(ArrayBuffer)
    // Camera points use exported glTF coordinates: +Y up, millimeters.
    const png = await renderGLTFToPNGFromGLB(glb as ArrayBuffer, {
      width: tileWidth,
      height: tileHeight - headingHeight,
      camPos: [55, 60, -65],
      lookAt: [0, 2, 9],
      up: "y+",
      fov: 35,
      backgroundColor: "#f2f3f5",
      ambient: 0.45,
    })
    context.drawImage(await loadImage(png), index * tileWidth, headingHeight)
    context.fillStyle = "#28323c"
    context.font = "20px sans-serif"
    context.fillText(
      index === 0 ? "Flat reference" : "Left tail folded · RR stays flat",
      index * tileWidth + 20,
      25,
    )
  }

  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
  )
})
