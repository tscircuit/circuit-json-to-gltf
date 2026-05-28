import {
  tscircuit_font_default
} from "./chunk-W5ZY3YD5.js";
import "./chunk-QGM4M3NI.js";

// lib/utils/svg-to-png.ts
import { Resvg } from "@resvg/resvg-js";
var isNode = typeof process !== "undefined" && process.versions && process.versions.node;
async function svgToPng(svgString, options = {}) {
  const fontBuffer = Buffer.from(tscircuit_font_default, "base64");
  let tempFontPath;
  let cleanupFn;
  if (isNode) {
    try {
      const [fs, os, path] = await Promise.all([
        import("fs"),
        import("os"),
        import("path")
      ]);
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "resvg-font-"));
      tempFontPath = path.join(tempDir, "tscircuit-font.ttf");
      fs.writeFileSync(tempFontPath, fontBuffer);
      cleanupFn = () => {
        try {
          fs.unlinkSync(tempFontPath);
        } catch {
        }
      };
    } catch (err) {
      console.warn(
        "Failed to create temporary font file, falling back to browser mode:",
        err
      );
    }
  }
  try {
    const opts = {
      background: options.background,
      fitTo: options.width ? {
        mode: "width",
        value: options.width
      } : options.height ? {
        mode: "height",
        value: options.height
      } : void 0,
      font: {
        fontFiles: tempFontPath ? [tempFontPath, ...options.fonts || []] : options.fonts || [],
        loadSystemFonts: false,
        defaultFontFamily: "TscircuitAlphabet",
        monospaceFamily: "TscircuitAlphabet",
        sansSerifFamily: "TscircuitAlphabet"
      }
    };
    const resvg = new Resvg(svgString, opts);
    const pngData = resvg.render();
    const pngBuffer = pngData.asPng();
    return Buffer.from(pngBuffer);
  } finally {
    if (cleanupFn) {
      cleanupFn();
    }
  }
}
async function svgToPngDataUrl(svgString, options = {}) {
  const pngBuffer = await svgToPng(svgString, options);
  return `data:image/png;base64,${pngBuffer.toString("base64")}`;
}
export {
  svgToPng,
  svgToPngDataUrl
};
