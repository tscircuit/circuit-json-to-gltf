import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { transformCircuitJsonCadComponents } from "@tscircuit/flex-utils"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import { createTwoArmFlex } from "../fixtures/two-arm-flex"

test("actual GLB textures and CAD follow independent and nested perpendicular bends", async () => {
  const independent = createTwoArmFlex()
  const nested = createTwoArmFlex({ rightArmBendSide: "left" })
  const inputs = [
    independent,
    transformCircuitJsonCadComponents(independent, { foldPcbs: true }),
    transformCircuitJsonCadComponents(nested, { foldPcbs: true }),
  ]
  const tileWidth = 720
  const tileHeight = 640
  const headingHeight = 38
  const canvas = createCanvas(tileWidth * inputs.length, tileHeight)
  const context = canvas.getContext("2d")
  context.fillStyle = "#f2f3f5"
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (const [index, input] of inputs.entries()) {
    const glb = await convertCircuitJsonToGltf(input, {
      format: "glb",
      boardTextureResolution: 1024,
    })
    // Exported glTF points are +Y up, millimeters. Stock PoppyGL 0.0.29
    // renders the actual GLB, including its developed top/bottom textures.
    const png = await renderGLTFToPNGFromGLB(glb as ArrayBuffer, {
      width: tileWidth,
      height: tileHeight - headingHeight,
      camPos: index === 2 ? [-105, 85, -100] : [70, 65, -70],
      lookAt: index === 2 ? [-32, 24, 6] : [-8, 0, 7],
      up: "y+",
      fov: 35,
      backgroundColor: "#f2f3f5",
      ambient: 0.45,
    })
    context.drawImage(await loadImage(png), index * tileWidth, headingHeight)
    context.fillStyle = "#28323c"
    context.font = "20px sans-serif"
    context.fillText(
      [
        "Flat reference",
        "Outward bends: R1 and R2 rise independently",
        "Original left side: child folds with parent body",
      ][index]!,
      index * tileWidth + 16,
      27,
    )
  }
  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
  )
})
