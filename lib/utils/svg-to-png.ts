import { Resvg, type ResvgRenderOptions } from "@resvg/resvg-js"
import { mkdtempSync, unlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import tscircuitFont from "../assets/tscircuit-font"

export interface SvgToPngOptions {
  width?: number
  height?: number
  background?: string
  fonts?: string[]
}

export async function svgToPng(
  svgString: string,
  options: SvgToPngOptions = {},
): Promise<Buffer> {
  // Decode the base64-encoded font and write to a temporary file
  const fontBuffer = Buffer.from(tscircuitFont, "base64")
  const tempDir = mkdtempSync(join(tmpdir(), "resvg-font-"))
  const tempFontPath = join(tempDir, "tscircuit-font.ttf")
  writeFileSync(tempFontPath, fontBuffer)

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
        fontFiles: [tempFontPath, ...(options.fonts || [])],
        loadSystemFonts: false,
        sansSerifFamily: "sans-serif",
      },
    }

    const resvg = new Resvg(svgString, opts)
    const pngData = resvg.render()
    const pngBuffer = pngData.asPng()

    return Buffer.from(pngBuffer)
  } finally {
    // Clean up temporary font file
    try {
      unlinkSync(tempFontPath)
    } catch {
      // Ignore errors during cleanup
    }
  }
}

export async function svgToPngDataUrl(
  svgString: string,
  options: SvgToPngOptions = {},
): Promise<string> {
  const pngBuffer = await svgToPng(svgString, options)
  return `data:image/png;base64,${pngBuffer.toString("base64")}`
}
