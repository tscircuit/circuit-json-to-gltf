import { Resvg, initWasm } from "@resvg/resvg-wasm"

let wasmInitialized = false

async function ensureWasmInitialized() {
  if (!wasmInitialized) {
    // Initialize WASM - in production you might want to host this file yourself
    await initWasm(
      fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm"),
    )
    wasmInitialized = true
  }
}

export interface SvgToPngOptions {
  width?: number
  height?: number
  background?: string
  fonts?: string[]
}

export async function svgToPng(
  svgString: string,
  options: SvgToPngOptions = {},
): Promise<Uint8Array> {
  await ensureWasmInitialized()

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
  }

  const resvg = new Resvg(svgString, opts)
  const pngData = resvg.render()
  const pngBuffer = pngData.asPng()

  return pngBuffer
}

export async function svgToPngDataUrl(
  svgString: string,
  options: SvgToPngOptions = {},
): Promise<string> {
  const pngBuffer = await svgToPng(svgString, options)

  // Convert Uint8Array to base64
  let binary = ""
  const bytes = new Uint8Array(pngBuffer)
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  const base64 = btoa(binary)

  return `data:image/png;base64,${base64}`
}
