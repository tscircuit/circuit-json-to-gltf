import {
  tscircuit_font_default
} from "./chunk-W5ZY3YD5.js";
import {
  __require
} from "./chunk-QGM4M3NI.js";

// lib/utils/svg-to-png-browser.ts
var wasmInitialized = false;
var Resvg;
var initWasm;
async function ensureWasmInitialized() {
  if (!wasmInitialized) {
    try {
      if (typeof process !== "undefined" && process.versions?.node) {
        const { readFileSync } = await import("fs");
        const { dirname, join } = await import("path");
        const resvgModule = await import("@resvg/resvg-wasm");
        Resvg = resvgModule.Resvg;
        initWasm = resvgModule.initWasm;
        try {
          const packagePath = __require.resolve("@resvg/resvg-wasm/package.json");
          const wasmPath = join(dirname(packagePath), "index_bg.wasm");
          const wasmBuffer = readFileSync(wasmPath);
          await initWasm(wasmBuffer);
        } catch (pathError) {
          try {
            const modulePath = __require.resolve("@resvg/resvg-wasm");
            const wasmPath = join(dirname(modulePath), "index_bg.wasm");
            const wasmBuffer = readFileSync(wasmPath);
            await initWasm(wasmBuffer);
          } catch (fallbackError) {
            throw new Error(
              `Failed to locate WASM file: ${pathError.message}, ${fallbackError.message}`
            );
          }
        }
      } else {
        try {
          const resvgModule = await import("@resvg/resvg-wasm");
          Resvg = resvgModule.Resvg;
          initWasm = resvgModule.initWasm;
          const wasmUrl = await import("@resvg/resvg-wasm/index_bg.wasm?url");
          await initWasm(fetch(wasmUrl.default));
        } catch {
          try {
            const cdnUrl = "https://cdn.jsdelivr.net/npm/@resvg/resvg-wasm@2.6.2/+esm";
            const resvgModule = await import(
              /* @vite-ignore */
              cdnUrl
            );
            Resvg = resvgModule.Resvg;
            initWasm = resvgModule.initWasm;
            await initWasm(
              fetch("https://unpkg.com/@resvg/resvg-wasm@2.6.2/index_bg.wasm")
            );
          } catch (cdnError) {
            throw new Error(
              `Failed to load resvg-wasm from CDN: ${cdnError.message}`
            );
          }
        }
      }
      wasmInitialized = true;
    } catch (error) {
      console.error("Failed to initialize WASM:", error);
      throw error;
    }
  }
}
async function svgToPng(svgString, options = {}) {
  await ensureWasmInitialized();
  const base64ToUint8Array = (base64) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };
  const fontBuffer = base64ToUint8Array(tscircuit_font_default);
  const opts = {
    background: options.background,
    font: {
      loadSystemFonts: false,
      fontBuffers: [fontBuffer],
      defaultFontFamily: "TscircuitAlphabet",
      monospaceFamily: "TscircuitAlphabet",
      sansSerifFamily: "TscircuitAlphabet"
    },
    fitTo: options.width ? {
      mode: "width",
      value: options.width
    } : options.height ? {
      mode: "height",
      value: options.height
    } : void 0
  };
  const resvg = new Resvg(svgString, opts);
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();
  return pngBuffer;
}
async function svgToPngDataUrl(svgString, options = {}) {
  const pngBuffer = await svgToPng(svgString, options);
  let binary = "";
  const bytes = new Uint8Array(pngBuffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return `data:image/png;base64,${base64}`;
}
export {
  svgToPng,
  svgToPngDataUrl
};
