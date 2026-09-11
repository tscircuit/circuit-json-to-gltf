import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import { svgToPng } from "../../lib/utils/svg-to-png"
import { svgToPng as svgToPngWasm } from "../../lib/utils/svg-to-png-browser"

// Use a wider canvas first so clipping cannot hide an oversized title.
const titleSvg = (boardWidth: number) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${boardWidth * 100}" height="400" viewBox="${-boardWidth / 2} -2 ${boardWidth} 4">
    <text x="0" y="-1.2" font-family="Arial, sans-serif" font-size="0.8" text-anchor="middle" dominant-baseline="central">HELLO</text>
    <text x="0" y="1.2" font-family="Arial, sans-serif" font-size="0.8" text-anchor="middle" dominant-baseline="central">0123456789</text>
    <text x="0" y="0" font-family="Arial, sans-serif" font-size="0.8" text-anchor="middle" dominant-baseline="central">SN74LVC1G17DCKR v1.0</text>
  </svg>`

function inkBounds(png: Uint8Array, width: number) {
  const encoded = Buffer.from(png).toString("base64")
  const rendered = new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="400"><image width="${width}" height="400" href="data:image/png;base64,${encoded}"/></svg>`,
  ).render()
  const pixels = rendered.pixels
  let minX = width
  let maxX = -1
  let inkPixels = 0
  const rows = [0, 0, 0]
  for (let y = 0; y < rendered.height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3]! > 127) {
        minX = Math.min(minX, x)
        maxX = Math.max(maxX, x)
        inkPixels++
        rows[y < 140 ? 0 : y < 260 ? 1 : 2]!++
      }
    }
  }
  return { minX, maxX, inkPixels, rows }
}

for (const [name, render] of [
  ["native", svgToPng],
  ["WASM", svgToPngWasm],
] as const) {
  test(`${name}: issue 197 title fits a 10.4 mm board without clipping`, async () => {
    const wide = inkBounds(await render(titleSvg(30)), 3000)
    const board = inkBounds(await render(titleSvg(10.4)), 1040)
    const widthMm = (wide.maxX - wide.minX + 1) / 100
    expect(widthMm).toBeGreaterThan(7)
    expect(widthMm).toBeLessThan(9.6)
    expect(board.minX).toBeGreaterThan(0)
    expect(board.maxX).toBeLessThan(1039)
    // Equal pixel scale: cropping preserves the ink, allowing edge rasterization rounding.
    expect(Math.abs(board.inkPixels - wide.inkPixels)).toBeLessThanOrEqual(2)
    for (const count of board.rows) expect(count).toBeGreaterThan(500)
  })
}
