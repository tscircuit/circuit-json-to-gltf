import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToPcbSvg } from "circuit-to-svg"
import type { BoardRenderOptions } from "../types"
import { getBoardColorPalette } from "../utils/board-color-palette"
import { createBoardSurfaceTextures } from "../utils/board-surface-textures"

interface SvgRaster {
  width: number
  height: number
  pixels: Uint8Array
  png: Uint8Array
}

const bytesToBase64 = (bytes: Uint8Array) => {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64")
  }
  let binary = ""
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
}

const rasterToDataUrl = (raster: SvgRaster) =>
  `data:image/png;base64,${bytesToBase64(raster.png)}`

async function rasterizeSvg(
  svgString: string,
  resolution: number,
  backgroundColor: string,
): Promise<SvgRaster> {
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    try {
      const { svgToRaster } = await import("../utils/svg-to-png-browser")
      return await svgToRaster(svgString, {
        width: resolution,
        background: backgroundColor,
      })
    } catch (error) {
      console.warn("Failed to rasterize SVG with resvg-wasm:", error)
      return convertSvgToCanvasBrowser(svgString, resolution, backgroundColor)
    }
  }

  const { svgToRaster } = await import("../utils/svg-to-png")
  return await svgToRaster(svgString, {
    width: resolution,
    background: backgroundColor,
  })
}

async function convertSvgToCanvasBrowser(
  svgString: string,
  resolution: number,
  backgroundColor: string,
): Promise<SvgRaster> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas")
    canvas.width = resolution
    canvas.height = resolution
    const context = canvas.getContext("2d")
    if (!context) return reject(new Error("Unable to create canvas context"))
    context.fillStyle = backgroundColor
    context.fillRect(0, 0, resolution, resolution)

    const image = new Image()
    image.onload = () => {
      try {
        context.drawImage(image, 0, 0, resolution, resolution)
        const pixels = Uint8Array.from(
          context.getImageData(0, 0, resolution, resolution).data,
        )
        const dataUrl = canvas.toDataURL("image/png")
        const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1)
        const binary = atob(base64)
        const png = Uint8Array.from(binary, (character) =>
          character.charCodeAt(0),
        )
        resolve({ width: resolution, height: resolution, pixels, png })
      } catch (error) {
        reject(error)
      }
    }
    image.onerror = reject
    image.src = `data:image/svg+xml;base64,${btoa(svgString)}`
  })
}

const createBoardLayerSvg = (
  circuitJson: CircuitJson,
  options: BoardRenderOptions,
) => {
  const palette = getBoardColorPalette(circuitJson, {
    solderMaskColor: options.backgroundColor,
    silkscreenColor: options.silkscreenColor,
  })
  const {
    layer,
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
      soldermask: { top: backgroundColor, bottom: backgroundColor },
      soldermaskOverCopper: {
        top: solderMaskWithCopperColor,
        bottom: solderMaskWithCopperColor,
      },
      copper: { top: copperColor, bottom: copperColor },
      silkscreen: { top: silkscreenColor, bottom: silkscreenColor },
      soldermaskWithCopperUnderneath: {
        top: solderMaskWithCopperColor,
        bottom: solderMaskWithCopperColor,
      },
      drill: drillColor,
    },
  })

  return { svg, backgroundColor }
}

export async function renderBoardLayer(
  circuitJson: CircuitJson,
  options: BoardRenderOptions,
): Promise<string> {
  const { svg, backgroundColor } = createBoardLayerSvg(circuitJson, options)
  const raster = await rasterizeSvg(
    svg,
    options.resolution ?? 1024,
    backgroundColor,
  )
  return rasterToDataUrl(raster)
}

async function renderBoardSurfaceLayer(
  circuitJson: CircuitJson,
  layer: "top" | "bottom",
  resolution: number,
) {
  // Synthetic colors make surface classification independent of solder-mask
  // choice: red is exposed copper, green is covered copper, blue is legend.
  const svg = convertCircuitJsonToPcbSvg(circuitJson, {
    layer,
    matchBoardAspectRatio: true,
    backgroundColor: "#000000",
    drawPaddingOutsideBoard: false,
    showSolderMask: true,
    showPcbNotes: false,
    colorOverrides: {
      soldermask: { top: "#000000", bottom: "#000000" },
      soldermaskOverCopper: { top: "#00ff00", bottom: "#00ff00" },
      copper: { top: "#ff0000", bottom: "#ff0000" },
      silkscreen: { top: "#0000ff", bottom: "#0000ff" },
      soldermaskWithCopperUnderneath: {
        top: "#00ff00",
        bottom: "#00ff00",
      },
      drill: "#000000",
    },
  })
  const raster = await rasterizeSvg(svg, resolution, "#000000")
  return await createBoardSurfaceTextures({
    width: raster.width,
    height: raster.height,
    classificationPixels: raster.pixels,
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
    surfaceMode = "realistic",
  }: Omit<BoardRenderOptions, "layer">,
): Promise<{
  top: string
  bottom: string
  topNormal?: string
  bottomNormal?: string
  topMetallicRoughness?: string
  bottomMetallicRoughness?: string
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
  const sharedOptions = {
    resolution,
    backgroundColor: resolvedBackgroundColor,
    copperColor,
    silkscreenColor: resolvedSilkscreenColor,
    solderMaskWithCopperColor: resolvedSolderMaskWithCopperColor,
    drillColor,
    showPcbNotes,
  }

  // Render sequentially to avoid concurrent Resvg WASM/native aliasing errors.
  const top = await renderBoardLayer(circuitJson, {
    ...sharedOptions,
    layer: "top",
  })
  const topSurface =
    surfaceMode === "realistic"
      ? await renderBoardSurfaceLayer(circuitJson, "top", resolution)
      : null
  const bottom = await renderBoardLayer(circuitJson, {
    ...sharedOptions,
    layer: "bottom",
  })
  const bottomSurface =
    surfaceMode === "realistic"
      ? await renderBoardSurfaceLayer(circuitJson, "bottom", resolution)
      : null

  return {
    top,
    bottom,
    topNormal: topSurface?.normal,
    bottomNormal: bottomSurface?.normal,
    topMetallicRoughness: topSurface?.metallicRoughness,
    bottomMetallicRoughness: bottomSurface?.metallicRoughness,
  }
}
