import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { BoardRenderOptions } from "../types"

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
    showPads: true,
    showTraces: true,
    showVias: true,
    showSilkscreen: true,
    colorOverrides: {
      copper: {
        top: copperColor,
        bottom: copperColor,
      },
      silkscreen: {
        top: silkscreenColor,
        bottom: silkscreenColor,
      },
      drill: drillColor,
    },
  })

  // Flip the SVG for the top layer to match 3D orientation
  const finalSvg =
    layer === "top" ? svg.replace("<svg", '<svg transform="scale(1, -1)"') : svg

  // Use the best SVG-to-PNG conversion method for the platform
  return await convertSvgToPng(finalSvg, resolution, backgroundColor)
}

// Intelligent SVG to PNG conversion based on platform
async function convertSvgToPng(svgString: string, resolution: number, backgroundColor: string): Promise<string> {
  // Check if we're in a browser environment
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    // Browser: Use Canvas API (works better for complex SVGs)
    return convertSvgToCanvasBrowser(svgString, resolution, backgroundColor)
  } else {
    // Node.js/Bun: Use WASM for high-quality rendering
    const { svgToPngDataUrl } = await import("../utils/svg-to-png-browser")
    return await svgToPngDataUrl(svgString, {
      width: resolution,
      background: backgroundColor,
    })
  }
}

// Browser-based Canvas SVG conversion
async function convertSvgToCanvasBrowser(svgString: string, resolution: number, backgroundColor: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas')
    canvas.width = resolution
    canvas.height = resolution
    const ctx = canvas.getContext('2d')!
    
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
        resolve(canvas.toDataURL('image/png'))
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
  resolution = 1024,
): Promise<{
  top: string
  bottom: string
}> {
  console.log("Generating PCB texture...")
  
  const [top, bottom] = await Promise.all([
    renderBoardLayer(circuitJson, {
      layer: "top",
      resolution,
      backgroundColor: "#008C00", // Green PCB background
    }),
    renderBoardLayer(circuitJson, {
      layer: "bottom",
      resolution,
      backgroundColor: "#006600", // Darker green for bottom layer
    }),
  ])
  
  console.log("PCB texture generated:", {
    topLength: top.length,
    bottomLength: bottom.length,
  })
  
  return { top, bottom }
}
