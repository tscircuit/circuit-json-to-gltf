import { test, expect } from "bun:test"
import { svgToPng, svgToPngDataUrl } from "../../lib/utils/svg-to-png"

test("svgToPng should convert SVG to PNG buffer", async () => {
  const simpleSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <rect width="100" height="100" fill="red"/>
  </svg>`

  const buffer = await svgToPng(simpleSvg)
  expect(buffer).toBeInstanceOf(Buffer)
  expect(buffer.length).toBeGreaterThan(0)
})

test("svgToPngDataUrl should return data URL", async () => {
  const simpleSvg = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
    <circle cx="50" cy="50" r="40" fill="blue"/>
  </svg>`

  const dataUrl = await svgToPngDataUrl(simpleSvg)
  expect(typeof dataUrl).toBe("string")
  expect(dataUrl).toStartWith("data:image/png;base64,")
})
