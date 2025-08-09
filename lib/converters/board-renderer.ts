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

  // Try using native browser SVG rendering instead of WASM
  return await convertSvgToCanvasDataUrl(finalSvg, resolution, backgroundColor)
}

// Convert SVG to Canvas-based PNG (alternative to WASM)
async function convertSvgToCanvasDataUrl(svgString: string, resolution: number, backgroundColor: string): Promise<string> {
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
    img.onerror = (error) => {
      console.error("Failed to load SVG image:", error)
      reject(error)
    }
    img.src = svgDataUrl
  })
}

// Generate a test texture to debug which face we're seeing
function generateDebugTexture(resolution: number): string {
  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution
  const ctx = canvas.getContext('2d')!
  
  // Fill with bright magenta background
  ctx.fillStyle = '#FF00FF'
  ctx.fillRect(0, 0, resolution, resolution)
  
  // Add large text to identify this as the texture
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `${resolution/8}px Arial`
  ctx.textAlign = 'center'
  ctx.fillText('PCB TEXTURE', resolution/2, resolution/2)
  ctx.fillText('TOP VIEW', resolution/2, resolution/2 + resolution/8)
  
  // Add corner markers
  ctx.fillStyle = '#FFFF00'
  const cornerSize = resolution/16
  ctx.fillRect(0, 0, cornerSize, cornerSize) // Top left
  ctx.fillRect(resolution-cornerSize, 0, cornerSize, cornerSize) // Top right
  ctx.fillRect(0, resolution-cornerSize, cornerSize, cornerSize) // Bottom left  
  ctx.fillRect(resolution-cornerSize, resolution-cornerSize, cornerSize, cornerSize) // Bottom right
  
  return canvas.toDataURL('image/png')
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
