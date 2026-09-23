import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import alphabetFont from "@tscircuit/alphabet/base64font"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import { renderBoardLayer } from "../../lib/converters/board-renderer"
import { svgToPng as renderWasm } from "../../lib/utils/svg-to-png-browser"

const circuit: CircuitJson = [
  {
    type: "pcb_board",
    pcb_board_id: "board1",
    center: { x: 0, y: 0 },
    width: 14,
    height: 6,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  },
  ...["iiiiiiii", "mmmmmmmm", "llllllll"].map((text, index) => ({
    type: "pcb_silkscreen_text" as const,
    pcb_silkscreen_text_id: `text${index}`,
    pcb_component_id: "board1",
    anchor_alignment: "center" as const,
    anchor_position: { x: 0, y: 1.5 - index * 1.5 },
    font: "tscircuit2024" as const,
    font_size: 1,
    layer: "top" as const,
    text,
    ccw_rotation: 0,
  })),
]

function sourceSvg() {
  return convertCircuitJsonToPcbSvg(circuit, {
    layer: "top",
    matchBoardAspectRatio: true,
    drawPaddingOutsideBoard: false,
    showSolderMask: true,
    backgroundColor: "black",
    colorOverrides: {
      silkscreen: { top: "white", bottom: "white" },
      soldermask: { top: "black", bottom: "black" },
    },
  })
}

test("PCB SVG embeds the same alphabet font used by texture rasterizers", () => {
  const svg = sourceSvg()
  expect(svg.includes('font-family="TscircuitAlphabet"')).toBe(true)
  expect(svg.includes(`data:font/ttf;base64,${alphabetFont}`)).toBe(true)
})

async function inkWidths(png: Uint8Array) {
  const image = await loadImage(Buffer.from(png))
  const ctx = createCanvas(image.width, image.height).getContext("2d")
  ctx.drawImage(image, 0, 0)
  const { data, width, height } = ctx.getImageData(
    0,
    0,
    image.width,
    image.height,
  )
  return [0, 1, 2].map((row) => {
    let left = width
    let right = -1
    for (
      let y = Math.floor((row * height) / 3);
      y < ((row + 1) * height) / 3;
      y++
    ) {
      for (let x = 0; x < width; x++) {
        const offset = (y * width + x) * 4
        if (
          data[offset]! > 230 &&
          data[offset + 1]! > 230 &&
          data[offset + 2]! > 230 &&
          data[offset + 3]! > 230
        ) {
          left = Math.min(left, x)
          right = Math.max(right, x)
        }
      }
    }
    expect(right).toBeGreaterThan(left)
    return right - left + 1
  })
}

async function expectNarrowGlyphAdvances(png: Uint8Array) {
  const [iWidth, mWidth, lWidth] = await inkWidths(png)
  // Eight narrow i/l glyphs should occupy substantially less space than
  // eight m glyphs. The old embedded font gave all three the same advance.
  expect(iWidth!).toBeLessThan(mWidth! * 0.7)
  expect(lWidth!).toBeLessThan(mWidth! * 0.7)
}

test("native board texture keeps narrow lowercase glyph advances", async () => {
  const texture = await renderBoardLayer(circuit, {
    layer: "top",
    resolution: 1400,
    backgroundColor: "black",
    silkscreenColor: "white",
  })
  await expectNarrowGlyphAdvances(Buffer.from(texture.split(",")[1]!, "base64"))
})

test("WASM board texture keeps narrow lowercase glyph advances", async () => {
  const png = await renderWasm(sourceSvg(), {
    width: 1400,
    background: "black",
  })
  await expectNarrowGlyphAdvances(png)
})
