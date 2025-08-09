import { Resvg } from "@resvg/resvg-js"

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
  const opts = {
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
      fontFiles: options.fonts || [],
    },
  }

  const resvg = new Resvg(svgString, opts)
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  return Buffer.from(pngBuffer)
}

export async function svgToPngDataUrl(
  svgString: string,
  options: SvgToPngOptions = {},
): Promise<string> {
  const pngBuffer = await svgToPng(svgString, options)
  return `data:image/png;base64,${pngBuffer.toString("base64")}`
}
