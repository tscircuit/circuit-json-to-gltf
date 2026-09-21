import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderBoardTextures } from "../../lib/converters/board-renderer"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import fixture from "../fixtures/via-tenting.json"

test("GLB via tenting inherits board defaults and preserves per-side overrides", async () => {
  const circuitJson = fixture as CircuitJson
  const textures = await renderBoardTextures(circuitJson, { resolution: 900 })
  function viaCenters(texture: string) {
    const { pixels } = new Resvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="500"><image href="${texture}" width="900" height="500"/></svg>`,
    ).render()
    const pixel = (x: number) =>
      Array.from(pixels.subarray((300 * 900 + x) * 4, (300 * 900 + x) * 4 + 4))
    return { inherited: pixel(150), exposed: pixel(450), tented: pixel(750) }
  }
  const top = viaCenters(textures.top)
  const bottom = viaCenters(textures.bottom)
  expect(top.inherited).toEqual(top.tented)
  expect(top.inherited).not.toEqual(top.exposed)
  expect(bottom.inherited).toEqual(bottom.exposed)
  expect(bottom.inherited).not.toEqual(bottom.tented)

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 1024,
    includeModels: false,
    showPcbNotes: true,
  })
  expect(glb).toBeInstanceOf(ArrayBuffer)
  // Use the top_down preset's +Y-up view, with its tilt reversed so labels read upright.
  const camera = getBestCameraPosition(circuitJson, {
    direction: [0, 1, -1e-3],
    ortho: true,
    aspectRatio: 1.8,
  })
  await expect(
    renderGLTFToPNGFromGLB(glb as ArrayBuffer, {
      ...camera,
      width: 900,
      height: 500,
      backgroundColor: [1, 1, 1],
    }),
  ).toMatchPngSnapshot(import.meta.path)
}, 30_000)
