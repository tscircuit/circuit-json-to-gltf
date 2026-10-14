import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderBoardTextures } from "../../lib/converters/board-renderer"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import fixture from "../fixtures/via-tenting.json"

test("GLB via tenting preserves pad openings and overlapping silkscreen text", async () => {
  const circuitJson = fixture as CircuitJson
  const textures = await renderBoardTextures(circuitJson, { resolution: 1200 })
  function readTexture(texture: string) {
    const { pixels } = new Resvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><image href="${texture}" width="1200" height="900"/></svg>`,
    ).render()
    const pixel = (x: number, y: number) => {
      const offset =
        (Math.round((9 - y) * 50) * 1200 + Math.round((x + 12) * 50)) * 4
      return Array.from(pixels.subarray(offset, offset + 4))
    }
    pixel.whitePixelCountInCircle = (x: number, y: number, radius = 0.65) => {
      const centerX = Math.round((x + 12) * 50)
      const centerY = Math.round((9 - y) * 50)
      const radiusPx = Math.round(radius * 50)
      let count = 0
      for (let dy = -radiusPx; dy <= radiusPx; dy++) {
        for (let dx = -radiusPx; dx <= radiusPx; dx++) {
          if (dx * dx + dy * dy > radiusPx * radiusPx) continue
          const offset = ((centerY + dy) * 1200 + centerX + dx) * 4
          if (
            pixels[offset] === 255 &&
            pixels[offset + 1] === 255 &&
            pixels[offset + 2] === 255 &&
            pixels[offset + 3] === 255
          ) {
            count++
          }
        }
      }
      return count
    }
    return pixel
  }
  const top = readTexture(textures.top)
  const bottom = readTexture(textures.bottom)
  expect(top.whitePixelCountInCircle(-8, 2)).toBeGreaterThan(0)
  expect(top.whitePixelCountInCircle(0, 2)).toBe(0)
  expect(top.whitePixelCountInCircle(8, 2)).toBeGreaterThan(0)
  expect(bottom.whitePixelCountInCircle(-8, 2)).toBe(0)
  expect(bottom.whitePixelCountInCircle(0, 2)).toBe(0)
  expect(bottom.whitePixelCountInCircle(8, 2)).toBeGreaterThan(0)

  expect(top(5, -4.2)).toEqual(top(3.5, -4.2))
  expect(top(6.2, -4.2)).toEqual(top(-5.5, -4.2))
  expect(top(5.9, -4.2)).toEqual(top(-6, -4.2))
  expect(top(3.5, -4.2)).not.toEqual(top(-6, -4.2))
  expect(bottom(5, -4.2)).toEqual(bottom(3.5, -4.2))
  expect(bottom(6.2, -4.2)).toEqual(bottom(-5.5, -4.2))
  expect(bottom(5.9, -4.2)).toEqual(bottom(-6, -4.2))
  expect(bottom(3.5, -4.2)).not.toEqual(bottom(-6, -4.2))

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 2048,
    includeModels: false,
    showPcbNotes: true,
  })
  expect(glb).toBeInstanceOf(ArrayBuffer)
  // Use the top_down preset's +Y-up view, with its tilt reversed so labels read upright.
  const camera = getBestCameraPosition(circuitJson, {
    direction: [0, 1, -1e-3],
    ortho: true,
    aspectRatio: 4 / 3,
  })
  await expect(
    renderGLTFToPNGFromGLB(glb as ArrayBuffer, {
      ...camera,
      width: 1200,
      height: 900,
      backgroundColor: [1, 1, 1],
    }),
  ).toMatchPngSnapshot(import.meta.path)
}, 30_000)
