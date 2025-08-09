import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { BoardRenderOptions } from "../types"
// Only import the WASM-compatible version for browser compatibility
import { svgToPngDataUrl } from "../utils/svg-to-png-browser"

export async function renderBoardLayer(
  circuitJson: CircuitJson,
  options: BoardRenderOptions,
): Promise<string> {
  const {
    layer,
    resolution = 1024,
    backgroundColor = "transparent",
    copperColor = "#ffe066",
    silkscreenColor = "#ffffff",
    padColor = "#ffe066",
    drillColor = "rgba(0,0,0,0.5)",
  } = options

  const svg = convertCircuitJsonToPcbSvg(circuitJson, {
    layer,
    matchBoardAspectRatio: true,
    backgroundColor,
    drawPaddingOutsideBoard: false,
    colorOverrides: {
      copper: {
        top: copperColor,
        bottom: copperColor,
      },
      silkscreen: {
        top: silkscreenColor,
        bottom: silkscreenColor,
      },
      pad: {
        top: padColor,
        bottom: padColor,
      },
      drill: drillColor,
    },
  })

  // Flip the SVG for the top layer to match 3D orientation
  const finalSvg =
    layer === "top" ? svg.replace("<svg", '<svg transform="scale(1, -1)"') : svg

  // Convert to PNG data URL using WASM version
  return await svgToPngDataUrl(finalSvg, {
    width: resolution,
    background: backgroundColor,
  })
}

export async function renderBoardTextures(
  circuitJson: CircuitJson,
  resolution = 1024,
): Promise<{
  top: string
  bottom: string
}> {
  const [top, bottom] = await Promise.all([
    renderBoardLayer(circuitJson, {
      layer: "top",
      resolution,
    }),
    renderBoardLayer(circuitJson, {
      layer: "bottom",
      resolution,
    }),
  ])

  return { top, bottom }
}
