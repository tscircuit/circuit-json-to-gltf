import { expect, test } from "bun:test"
import { createBoardSurfaceTextures } from "../../lib/utils/board-surface-textures"
import { svgToRaster } from "../../lib/utils/svg-to-png"

const decodePngDataUrl = async (
  dataUrl: string,
  width: number,
  height: number,
) =>
  await svgToRaster(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><image href="${dataUrl}" width="${width}" height="${height}" /></svg>`,
    { width },
  )

const expectWithin = (
  value: number | undefined,
  minimum: number,
  maximum: number,
) => {
  expect(value).toBeGreaterThanOrEqual(minimum)
  expect(value).toBeLessThanOrEqual(maximum)
}

test("realistic surface maps encode mask, covered copper, ENIG, and legend", async () => {
  const classificationPixels = Uint8Array.from([
    0, 0, 0, 255, 0, 255, 0, 255, 255, 0, 0, 255, 0, 0, 255, 255,
  ])
  const maps = await createBoardSurfaceTextures({
    width: 4,
    height: 1,
    classificationPixels,
  })
  const metallicRoughness = await decodePngDataUrl(maps.metallicRoughness, 4, 1)

  const pixel = (index: number) =>
    metallicRoughness.pixels.slice(index * 4, index * 4 + 4)
  const plainMask = pixel(0)
  const maskedCopper = pixel(1)
  const exposedCopper = pixel(2)
  const legend = pixel(3)

  expectWithin(plainMask[1], 176, 180)
  expectWithin(plainMask[2], 3, 5)
  expectWithin(maskedCopper[1], 138, 145)
  expectWithin(maskedCopper[2], 5, 7)
  expectWithin(exposedCopper[1], 100, 116)
  expectWithin(exposedCopper[2], 126, 129)
  expectWithin(legend[1], 192, 195)
  expect(legend[2]).toBe(0)

  const normal = await decodePngDataUrl(maps.normal, 4, 1)
  expect(normal.pixels.length).toBe(16)
  expect(normal.pixels[3]).toBe(255)
  expect(
    normal.pixels.some((value, index) => index % 4 !== 3 && value !== 128),
  ).toBe(true)
})
