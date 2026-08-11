import { Resvg, type ResvgRenderOptions } from "@resvg/resvg-js"
import tscircuitFont from "../assets/tscircuit-font"

export interface SvgToPngOptions {
  width?: number
  height?: number
  background?: string
  fonts?: string[]
}

export interface SvgRaster {
  width: number
  height: number
  pixels: Uint8Array
  png: Uint8Array
}

// Helper to check if we're in a Node.js environment
const isNode =
  typeof process !== "undefined" && process.versions && process.versions.node

export async function svgToRaster(
  svgString: string,
  options: SvgToPngOptions = {},
): Promise<SvgRaster> {
  const fontBuffer = Buffer.from(tscircuitFont, "base64")

  let tempFontPath: string | undefined
  let cleanupFn: (() => void) | undefined

  // In Node.js, write font to a temporary file
  if (isNode) {
    try {
      const [fs, os, path] = await Promise.all([
        import("node:fs"),
        import("node:os"),
        import("node:path"),
      ])

      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "resvg-font-"))
      tempFontPath = path.join(tempDir, "tscircuit-font.ttf")
      fs.writeFileSync(tempFontPath, fontBuffer)

      cleanupFn = () => {
        try {
          fs.unlinkSync(tempFontPath!)
        } catch {
          // Ignore errors during cleanup
        }
      }
    } catch (err) {
      console.warn(
        "Failed to create temporary font file, falling back to browser mode:",
        err,
      )
    }
  }

  try {
    const opts: ResvgRenderOptions = {
      background: options.background,
      fitTo: options.width
        ? {
            mode: "width" as const,
            value: options.width,
          }
        : options.height
          ? {
              mode: "height" as const,
              value: options.height,
            }
          : undefined,
      font: {
        fontFiles: tempFontPath
          ? [tempFontPath, ...(options.fonts || [])]
          : options.fonts || [],
        loadSystemFonts: false,
        defaultFontFamily: "TscircuitAlphabet",
        monospaceFamily: "TscircuitAlphabet",
        sansSerifFamily: "TscircuitAlphabet",
      },
    }

    const resvg = new Resvg(svgString, opts)
    const renderedImage = resvg.render()
    const pngBuffer = renderedImage.asPng()

    return {
      width: renderedImage.width,
      height: renderedImage.height,
      pixels: Uint8Array.from(renderedImage.pixels),
      png: Uint8Array.from(pngBuffer),
    }
  } finally {
    // Clean up temporary font file
    if (cleanupFn) {
      cleanupFn()
    }
  }
}

export async function svgToPng(
  svgString: string,
  options: SvgToPngOptions = {},
): Promise<Buffer> {
  const raster = await svgToRaster(svgString, options)
  return Buffer.from(raster.png)
}

export async function svgToPngDataUrl(
  svgString: string,
  options: SvgToPngOptions = {},
): Promise<string> {
  const pngBuffer = await svgToPng(svgString, options)
  return `data:image/png;base64,${pngBuffer.toString("base64")}`
}
