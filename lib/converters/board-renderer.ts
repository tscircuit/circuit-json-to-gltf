import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { BoardRenderOptions } from "../types"

/** W15.P4.B (EnergyCitizen fork): solder mask color preset → hex map.
 *  Matches the BoardColor enum in @tscircuit/props (green, red, blue,
 *  purple, black, white, yellow, not_specified). */
const SOLDER_MASK_HEX: Record<string, { mask: string; over: string }> = {
  green: { mask: "#0F3812", over: "#69e778ff" },
  red: { mask: "#3a0a0a", over: "#d63232ff" },
  blue: { mask: "#0a1a3a", over: "#3252d6ff" },
  purple: { mask: "#1f0a3a", over: "#9a3ad6ff" },
  black: { mask: "#0a0a0a", over: "#404040ff" },
  white: { mask: "#e8e8e8", over: "#ffffffff" },
  yellow: { mask: "#3a3000", over: "#e2c800ff" },
  not_specified: { mask: "#0F3812", over: "#69e778ff" },
}

const getBoardColor = (circuitJson: CircuitJson): string => {
  const board = (circuitJson as Array<{ type?: string; solder_mask_color?: string }>).find(
    (x) => x?.type === "pcb_board",
  )
  return board?.solder_mask_color ?? "not_specified"
}

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
    drillColor = "rgba(0,0,0,0.5)",
    showPcbNotes = false,
  } = options

  const colorKey = getBoardColor(circuitJson)
  const colors = SOLDER_MASK_HEX[colorKey] ?? SOLDER_MASK_HEX.not_specified!

  const svg = convertCircuitJsonToPcbSvg(circuitJson, {
    layer,
    matchBoardAspectRatio: true,
    backgroundColor,
    drawPaddingOutsideBoard: false,
    showSolderMask: true,
    showPcbNotes,
    colorOverrides: {
      copper: {
        top: copperColor,
        bottom: copperColor,
      },
      silkscreen: {
        top: silkscreenColor,
        bottom: silkscreenColor,
      },
      soldermaskWithCopperUnderneath: {
        top: colors.over,
        bottom: colors.over,
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
  { resolution = 1024, showPcbNotes = false },
): Promise<{
  top: string
  bottom: string
}> {
  // Render sequentially to avoid concurrent Resvg WASM usage
  // which causes "recursive use of an object" Rust aliasing errors
  const colorKey = getBoardColor(circuitJson)
  const colors = SOLDER_MASK_HEX[colorKey] ?? SOLDER_MASK_HEX.not_specified!
  const top = await renderBoardLayer(circuitJson, {
    layer: "top",
    resolution,
    backgroundColor: colors.mask,
    showPcbNotes,
  })
  const bottom = await renderBoardLayer(circuitJson, {
    layer: "bottom",
    resolution,
    backgroundColor: colors.mask,
    showPcbNotes,
  })

  return { top, bottom }
}
