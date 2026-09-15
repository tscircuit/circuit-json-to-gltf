import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { svgToPng as nativeSvgToPng } from "../../lib/utils/svg-to-png"
import { svgToPng as wasmSvgToPng } from "../../lib/utils/svg-to-png-browser"

// The label reported in a GLB snapshot. Use SVG text (as the board renderer
// does), so the test exercises the font supplied to resvg, not canvas fonts.
const label = "74LVC1G08GW v1.0"
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1500" height="200">
  <text x="30" y="140" font-family="TscircuitAlphabet" font-size="100" fill="white">${label}</text>
</svg>`

for (const [name, render] of [
  ["native", nativeSvgToPng],
  ["WASM", wasmSvgToPng],
] as const) {
  test(`${name} snapshot font keeps the v in v1.0 on the digit baseline`, async () => {
    const png = await render(svg)
    const image = await loadImage(Buffer.from(png))
    const canvas = createCanvas(image.width, image.height)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(image, 0, 0)
    const { data, width, height } = ctx.getImageData(
      0,
      0,
      canvas.width,
      canvas.height,
    )
    const glyphs: { top: number; bottom: number }[] = []
    let glyph: { top: number; bottom: number } | undefined
    for (let x = 0; x < width; x++) {
      const rows: number[] = []
      for (let y = 0; y < height; y++) {
        if (data[(y * width + x) * 4 + 3]! > 127) rows.push(y)
      }
      if (rows.length === 0) {
        glyph = undefined
        continue
      }
      if (!glyph) {
        glyph = { top: height, bottom: 0 }
        glyphs.push(glyph)
      }
      glyph.top = Math.min(glyph.top, ...rows)
      glyph.bottom = Math.max(glyph.bottom, ...rows)
    }
    expect(glyphs).toHaveLength(label.replaceAll(" ", "").length)
    const [v, one, , zero] = glyphs.slice(-4)
    // The old embedded font places v about 20 pixels above the baseline at
    // this size. Allow a few pixels for optical overshoot and rasterization.
    expect(v!.top).toBeGreaterThan(one!.top + 10)
    expect(Math.abs(v!.bottom - one!.bottom)).toBeLessThanOrEqual(4)
    expect(Math.abs(v!.bottom - zero!.bottom)).toBeLessThanOrEqual(4)
    await expect(png).toMatchPngSnapshot(
      import.meta.path,
      `version-label-${name}`,
    )
  })
}
