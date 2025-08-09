import { Resvg, initWasm } from "@resvg/resvg-wasm"

let wasmInitialized = false

async function ensureWasmInitialized() {
  if (!wasmInitialized) {
    try {
      // Check if we're in a Node.js/Bun environment
      if (typeof process !== "undefined" && process.versions?.node) {
        // Dynamically import Node.js modules only in Node.js environment
        const { readFileSync } = await import("fs")
        const { fileURLToPath } = await import("url")
        const { dirname, join } = await import("path")
        
        // Load WASM file directly from node_modules
        const currentDir = dirname(fileURLToPath(import.meta.url))
        const wasmPath = join(currentDir, "../../node_modules/@resvg/resvg-wasm/index_bg.wasm")
        const wasmBuffer = readFileSync(wasmPath)
        await initWasm(wasmBuffer)
      } else {
        // Browser environment - try to load from URL
        try {
          // @ts-ignore - Vite will handle this import
          const wasmUrl = await import("@resvg/resvg-wasm/index_bg.wasm?url")
          await initWasm(fetch(wasmUrl.default))
        } catch {
          // Fallback to CDN
          await initWasm(fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm"))
        }
      }
      wasmInitialized = true
    } catch (error) {
      console.error("Failed to initialize WASM:", error)
      throw error
    }
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
  const len = bytes.byteLength
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  const base64 = btoa(binary)

  return `data:image/png;base64,${base64}`
}
