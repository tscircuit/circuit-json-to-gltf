import { expect, test } from "bun:test"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { Resvg } from "@resvg/resvg-js"
import { convertCircuitJsonToGltf, renderBoardTextures } from "../../lib"
import { padOverlappingVia } from "../fixtures/pad-overlapping-via"

test("tented via overlapping a pad keeps a green ring and open gold bore", async () => {
  const textures = await renderBoardTextures(padOverlappingVia, {
    resolution: 600,
  })
  const { pixels } = new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400"><image href="${textures.top}" width="600" height="400"/></svg>`,
  ).render()
  const pixel = (x: number, y: number) => {
    const offset =
      (Math.round((7 - y) * 100) * 600 + Math.round((x - 7) * 100)) * 4
    return Array.from(pixels.subarray(offset, offset + 4))
  }
  // The annulus outside the pad uses the existing tented surface color.
  expect(pixel(10.65, 5)).toEqual(pixel(12.65, 6.2))
  expect(pixel(10.65, 5)).not.toEqual(pixel(9.3, 5))
  const glb = (await convertCircuitJsonToGltf(padOverlappingVia, {
    format: "glb",
    includeModels: false,
    boardTextureResolution: 1200,
  })) as ArrayBuffer
  await expect(
    renderGLTFToPNGFromGLB(glb, {
      width: 800,
      height: 600,
      camPos: [-10, 10, 7],
      lookAt: [-10, 0, 5],
      ambient: 0.6,
      backgroundColor: [0.9, 0.9, 0.9],
    }),
  ).toMatchPngSnapshot(import.meta.path)
}, 30_000)
