import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import {
  createBendZoneFlex,
  createNonparallelFlex,
} from "../fixtures/invalid-flex"

test("invalid flex inputs retain exportable geometry with visible flat fallbacks", async () => {
  const tileWidth = 720
  const tileHeight = 580
  const headingHeight = 40
  const canvas = createCanvas(tileWidth * 2, tileHeight)
  const context = canvas.getContext("2d")
  context.fillStyle = "#f2f3f5"
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (const [index, input] of [
    createNonparallelFlex(),
    createBendZoneFlex(true),
  ].entries()) {
    const glb = await convertCircuitJsonToGltf(input, {
      format: "glb",
      foldPcbs: true,
      boardTextureResolution: 1024,
    })
    const png = await renderGLTFToPNGFromGLB(glb as ArrayBuffer, {
      width: tileWidth,
      height: tileHeight - headingHeight,
      // Points in exported glTF: +Y up, millimeters. This is the same camera
      // boundary as finite-tail-flex, with no format or mesh compensations.
      camPos: index === 0 ? [70, 65, -70] : [-50, 42, -48],
      lookAt: index === 0 ? [-8, 0, 7] : [0, 7, 0],
      up: "y+",
      fov: 35,
      backgroundColor: "#f2f3f5",
      ambient: 0.45,
    })
    context.drawImage(await loadImage(png), index * tileWidth, headingHeight)
    context.fillStyle = "#28323c"
    context.font = "20px sans-serif"
    context.fillText(
      index === 0
        ? "Unsupported bends: board and R1/R2 stay flat"
        : "Bend-zone R1/stiffener stay flat; board and R3 fold",
      index * tileWidth + 18,
      27,
    )
  }
  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
  )
})
