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
    return (x: number, y: number) => {
      const offset =
        (Math.round((9 - y) * 50) * 1200 + Math.round((x + 12) * 50)) * 4
      return Array.from(pixels.subarray(offset, offset + 4))
    }
  }
  const top = readTexture(textures.top)
  const bottom = readTexture(textures.bottom)
  const white = [255, 255, 255, 255]
  expect(top(-8, 2)).toEqual(white)
  expect(top(0, 2)).not.toEqual(white)
  expect(top(8, 2)).toEqual(white)
  expect(bottom(-8, 2)).not.toEqual(white)
  expect(bottom(0, 2)).not.toEqual(white)
  expect(bottom(8, 2)).toEqual(white)

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

  // Inspect the exported images too: callers consume the GLB, not the separate
  // texture renderer. Silkscreen must survive over the via on both board faces.
  const view = new DataView(glb as ArrayBuffer)
  const jsonLength = view.getUint32(12, true)
  const gltf = JSON.parse(
    new TextDecoder().decode(
      new Uint8Array(glb as ArrayBuffer, 20, jsonLength),
    ),
  )
  const binaryOffset = 20 + jsonLength + 8
  expect(gltf.images).toHaveLength(2)
  for (const image of gltf.images) {
    const imageView = gltf.bufferViews[image.bufferView]
    const png = new Uint8Array(
      glb as ArrayBuffer,
      binaryOffset + (imageView.byteOffset ?? 0),
      imageView.byteLength,
    )
    const texture = readTexture(
      `data:image/png;base64,${Buffer.from(png).toString("base64")}`,
    )
    expect(texture(8, 2)).toEqual(white)
    // The exposed via remains exposed; this is not a global white overlay.
    expect(texture(0, 2)).not.toEqual(white)
  }
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
