import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { BoardRenderOptions } from "../types"
import { getBoardColorPalette } from "../utils/board-color-palette"

export async function renderBoardLayer(
  circuitJson: CircuitJson,
  options: BoardRenderOptions,
): Promise<string> {
  const palette = getBoardColorPalette(circuitJson, {
    solderMaskColor: options.backgroundColor,
    silkscreenColor: options.silkscreenColor,
  })
  const {
    layer,
    resolution = 1024,
    copperColor = "#ffe066",
    drillColor = "rgba(0,0,0,0.5)",
    showPcbNotes = false,
  } = options
  const backgroundColor =
    options.backgroundColor ?? palette.backgroundColor ?? "transparent"
  const silkscreenColor =
    options.silkscreenColor ?? palette.silkscreenColor ?? "#ffffff"
  const solderMaskWithCopperColor =
    options.solderMaskWithCopperColor ??
    palette.solderMaskWithCopperColor ??
    "#69e778ff"

  const svg = convertCircuitJsonToPcbSvg(circuitJson, {
    layer,
    matchBoardAspectRatio: true,
    backgroundColor,
    drawPaddingOutsideBoard: false,
    showSolderMask: true,
    showPcbNotes,
    colorOverrides: {
      soldermask: {
        top: backgroundColor,
        bottom: backgroundColor,
      },
      soldermaskOverCopper: {
        top: solderMaskWithCopperColor,
        bottom: solderMaskWithCopperColor,
      },
      copper: {
        top: copperColor,
        bottom: copperColor,
      },
      silkscreen: {
        top: silkscreenColor,
        bottom: silkscreenColor,
      },
      soldermaskWithCopperUnderneath: {
        top: solderMaskWithCopperColor,
        bottom: solderMaskWithCopperColor,
      },
      drill: drillColor,
    },
  })

  // Use the SVG without transformation
  const finalSvg = svg

  // Use the best SVG-to-PNG conversion method for the platform
  return await convertSvgToPng(finalSvg, resolution, backgroundColor)
}

// Intelligent SVG to PNG conversion based on platform
async function convertSvgToPng(
  svgString: string,
  resolution: number,
  backgroundColor: string,
): Promise<string> {
  // Check if we're in a browser environment
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    const { svgToPngDataUrl } = await import("../utils/svg-to-png-browser")

    return await svgToPngDataUrl(svgString, {
      width: resolution,
      background: backgroundColor,
    })
  } else {
    // Node.js/Bun: Use native Resvg for high-quality rendering
    try {
      const { svgToPngDataUrl } = await import("../utils/svg-to-png")
      return await svgToPngDataUrl(svgString, {
        width: resolution,
        background: backgroundColor,
      })
    } catch (error) {
      console.warn(
        "Failed to load native svg-to-png, falling back to browser method:",
        error,
      )
      // Fallback to canvas method if native import fails
      return convertSvgToCanvasBrowser(svgString, resolution, backgroundColor)
    }
  }
}

// Browser-based Canvas SVG conversion
async function convertSvgToCanvasBrowser(
  svgString: string,
  resolution: number,
  backgroundColor: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    canvas.width = resolution
    canvas.height = resolution
    const ctx = canvas.getContext("2d")!

    // Fill with background color first
    ctx.fillStyle = backgroundColor
    ctx.fillRect(0, 0, resolution, resolution)

    // Create SVG data URL
    const svgDataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`

    // Create image from SVG
    const img = new Image()
    img.onload = () => {
      try {
        ctx.drawImage(img, 0, 0, resolution, resolution)
        resolve(canvas.toDataURL("image/png"))
      } catch (error) {
        reject(error)
      }
    }
    img.onerror = (error: any) => {
      console.error("Failed to load SVG image:", error)
      reject(error)
    }
    img.src = svgDataUrl
  })
}

export async function renderBoardTextures(
  circuitJson: CircuitJson,
  {
    resolution = 1024,
    backgroundColor,
    copperColor,
    silkscreenColor,
    solderMaskWithCopperColor,
    drillColor,
    showPcbNotes = false,
  }: Omit<BoardRenderOptions, "layer">,
): Promise<{
  top: string
  bottom: string
}> {
  const palette = getBoardColorPalette(circuitJson, {
    solderMaskColor: backgroundColor,
    silkscreenColor,
  })
  const resolvedBackgroundColor =
    backgroundColor ?? palette.backgroundColor ?? "#0F3812"
  const resolvedSilkscreenColor =
    silkscreenColor ?? palette.silkscreenColor ?? "#ffffff"
  const resolvedSolderMaskWithCopperColor =
    solderMaskWithCopperColor ??
    palette.solderMaskWithCopperColor ??
    "#69e778ff"

  // Render sequentially to avoid concurrent Resvg WASM usage
  // which causes "recursive use of an object" Rust aliasing errors
  const top = await renderBoardLayer(circuitJson, {
    layer: "top",
    resolution,
    backgroundColor: resolvedBackgroundColor,
    copperColor,
    silkscreenColor: resolvedSilkscreenColor,
    solderMaskWithCopperColor: resolvedSolderMaskWithCopperColor,
    drillColor,
    showPcbNotes,
  })
  const bottom = await renderBoardLayer(circuitJson, {
    layer: "bottom",
    resolution,
    backgroundColor: resolvedBackgroundColor,
    copperColor,
    silkscreenColor: resolvedSilkscreenColor,
    solderMaskWithCopperColor: resolvedSolderMaskWithCopperColor,
    drillColor,
    showPcbNotes,
  })

  return { top, bottom }
}
