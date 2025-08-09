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

  console.log(`Generated SVG for ${layer} layer:`, {
    length: svg.length,
    hasTraces: svg.includes('pcb-trace'),
    hasPads: svg.includes('pcb-pad'),
    hasVias: svg.includes('pcb-via'),
    preview: svg.slice(0, 200)
  })

  // Flip the SVG for the top layer to match 3D orientation
  const finalSvg =
    layer === "top" ? svg.replace("<svg", '<svg transform="scale(1, -1)"') : svg

  // Convert to PNG data URL using WASM version
  const pngResult = await svgToPngDataUrl(finalSvg, {
    width: resolution,
    background: backgroundColor,
  })
  
  console.log(`PNG conversion result for ${layer}:`, {
    length: pngResult.length,
    preview: pngResult.slice(0, 50)
  })
  
  // Create downloadable links for debugging
  const svgBlob = new Blob([finalSvg], { type: 'image/svg+xml' })
  const svgUrl = URL.createObjectURL(svgBlob)
  
  // Convert PNG data URL to blob for download
  const pngData = pngResult.split(',')[1]
  const pngBytes = Uint8Array.from(atob(pngData), c => c.charCodeAt(0))
  const pngBlob = new Blob([pngBytes], { type: 'image/png' })
  const pngUrl = URL.createObjectURL(pngBlob)
  
  console.log(`Download links for ${layer} layer:`)
  console.log(`SVG: `, svgUrl)
  console.log(`PNG: `, pngUrl)
  console.log(`To download, run: 
    const a = document.createElement('a')
    a.href = '${svgUrl}'
    a.download = '${layer}-layer.svg'
    a.click()
  `)
  
  return pngResult
}

// Generate a simple test texture to verify the pipeline works
function generateTestTexture(resolution: number): string {
  // Create a simple checkerboard pattern
  const canvas = document.createElement('canvas')
  canvas.width = resolution
  canvas.height = resolution
  const ctx = canvas.getContext('2d')!
  
  const squareSize = resolution / 8 // 8x8 checkerboard
  
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 8; y++) {
      const isBlack = (x + y) % 2 === 0
      ctx.fillStyle = isBlack ? '#FF0000' : '#00FF00' // Red and green squares
      ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize)
    }
  }
  
  return canvas.toDataURL('image/png')
}

export async function renderBoardTextures(
  circuitJson: CircuitJson,
  resolution = 1024,
): Promise<{
  top: string
  bottom: string
}> {
  console.log("Attempting to generate PCB texture...")
  
  try {
    // Try to render actual PCB texture
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
    
    console.log("PCB texture generated successfully:", {
      topLength: top.length,
      bottomLength: bottom.length,
      topPreview: top.slice(0, 100),
    })
    
    // Check if the generated texture looks reasonable
    if (top.length < 1000 || bottom.length < 1000) {
      console.warn("PCB texture suspiciously small, using fallback")
      const testTexture = generateTestTexture(resolution)
      return { top: testTexture, bottom: testTexture }
    }
    
    return { top, bottom }
    
  } catch (error) {
    console.error("PCB texture generation failed:", error)
    // Fallback to test texture
    const testTexture = generateTestTexture(resolution)
    return { top: testTexture, bottom: testTexture }
  }
}
