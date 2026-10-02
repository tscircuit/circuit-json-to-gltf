import {
  glyphAdvanceRatio,
  glyphLineAlphabet,
  textMetrics,
} from "@tscircuit/alphabet"
import { mat4, vec4 } from "gl-matrix"

export interface PoppyglErrorOverlayOptions {
  /** Final image dimensions in pixels, before PoppyGL supersampling. */
  width: number
  height: number
  supersampling?: number
  /** Font height in final image pixels. Default: 16. */
  debugFontSize?: number
}

export interface PoppyglErrorOverlay {
  debugPoints: Array<{
    label: string
    /** Layout anchor in the exported glTF world frame: +Y up, millimeters.
     * This is a point, so camera translation applies. It is not an error's
     * physical position on the circuit. */
    position: { x: number; y: number; z: number }
  }>
  debugFontSize: number
}

function readErrorMessages(gltf: unknown): string[] | undefined {
  if (!gltf || typeof gltf !== "object") return
  const document = gltf as { scene?: number; scenes?: unknown[] }
  const scene = document.scenes?.[document.scene ?? 0] as
    | { extras?: { tscircuit?: { errorMessages?: unknown } } }
    | undefined
  const messages = scene?.extras?.tscircuit?.errorMessages
  if (
    !Array.isArray(messages) ||
    messages.length === 0 ||
    !messages.every((message) => typeof message === "string")
  )
    return
  return messages
}

// Match stock PoppyGL drawDebugPoints' glyph resolution and width convention.
// Unsupported characters are displayed as visible code points; the complete
// original strings remain untouched in extras.tscircuit.errorMessages.
function displayText(message: string): string {
  return Array.from(message, (character) => {
    if (character === ":") return " - "
    if (character === ";") return ","
    if (character === "?") return "."
    if (
      character === " " ||
      character === "\n" ||
      glyphLineAlphabet[character] ||
      glyphLineAlphabet[character.toUpperCase()]
    )
      return character
    if (character === "\r") return ""
    if (character === "\t") return "    "
    return `[U+${character.codePointAt(0)!.toString(16).toUpperCase().padStart(4, "0")}]`
  })
    .join("")
    .replace(/ +/g, " ")
}

function characterWidth(character: string, fontSize: number): number {
  const resolved = glyphLineAlphabet[character]
    ? character
    : character.toUpperCase()
  return (
    (glyphAdvanceRatio[resolved] ??
      (character === " "
        ? textMetrics.spaceWidthRatio
        : textMetrics.glyphWidthRatio)) *
    fontSize *
    0.62
  )
}

function wrapText(text: string, width: number, fontSize: number): string[] {
  const lines: string[] = []
  for (const paragraph of text.split("\n")) {
    let remaining = paragraph
    do {
      let end = 0
      let lineWidth = 0
      while (end < remaining.length) {
        const nextWidth = characterWidth(remaining[end]!, fontSize)
        if (end > 0 && lineWidth + nextWidth > width) break
        lineWidth += nextWidth
        end++
      }
      if (end < remaining.length) {
        const space = remaining.lastIndexOf(" ", end)
        if (space > 0) end = space
      }
      lines.push(remaining.slice(0, end).trimEnd())
      remaining = remaining.slice(end).trimStart()
    } while (remaining.length)
  }
  return lines
}

/** Adapt Circuit JSON error metadata to stock PoppyGL's existing debug labels.
 *
 * Supply the camera built from the same draw calls and render options used by
 * PoppyGL. Each label's screen layout anchor is unprojected through the inverse
 * of camera.proj * camera.view (the paired reference is PoppyGL's
 * drawDebugPoints/projectWorldToScreen). The resulting point is in the final
 * glTF world frame, +Y up and millimeters; it does not locate a circuit error.
 * Recompute these options whenever the camera or image dimensions change.
 *
 * Width, height and the requested font size are final image pixels. Stock
 * PoppyGL draws debug labels before downsampling, so the returned font size
 * and pixel anchors account for its supersampling factor. No geometry, camera
 * matrices or metadata are modified. Returns undefined when no errors exist.
 */
export function getPoppyglErrorOverlayOptions(
  gltf: unknown,
  camera: { view: mat4; proj: mat4 },
  options: PoppyglErrorOverlayOptions,
): PoppyglErrorOverlay | undefined {
  const messages = readErrorMessages(gltf)
  if (!messages) return
  const { width, height } = options
  const fontSize = options.debugFontSize ?? 16
  if (
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    !Number.isFinite(fontSize) ||
    width < 2 ||
    height < 2 ||
    fontSize < 1
  )
    throw new RangeError("Error overlay requires positive image and font sizes")

  // Match stock PoppyGL resolveRenderOptions' supersampling normalization.
  const supersampling = Number.isFinite(options.supersampling)
    ? Math.max(1, Math.floor(options.supersampling!))
    : 1
  const scaledFont = Math.max(1, Math.round(fontSize * supersampling))
  const finalFont = scaledFont / supersampling
  const margin = 16
  const labelWidth = Math.max(1, width - margin * 2 - finalFont * 0.6 - 2)
  const lines = [
    ...wrapText(
      `Circuit JSON errors (${messages.length})`,
      labelWidth,
      finalFont,
    ),
    ...messages.flatMap((message, index) =>
      wrapText(`${index + 1}. ${displayText(message)}`, labelWidth, finalFont),
    ),
  ]
  const rowHeight = finalFont * 1.4
  const availableRows = Math.max(
    1,
    1 + Math.floor((height - margin * 2 - finalFont * 1.1) / rowHeight),
  )
  if (lines.length > availableRows) {
    let keptRows = availableRows - 1
    let disclosure: string[]
    // Reserve enough rows for the short overflow count, including narrow
    // viewports where that count itself wraps. The original messages are kept.
    for (;;) {
      disclosure = wrapText(
        `${lines.length - keptRows} more lines`,
        labelWidth,
        finalFont,
      )
      const nextKeptRows = Math.max(0, availableRows - disclosure.length)
      if (nextKeptRows === keptRows) break
      keptRows = nextKeptRows
    }
    lines.splice(keptRows)
    lines.push(...disclosure.slice(0, availableRows - keptRows))
  }
  const firstTextY = margin
  const viewProjection = mat4.multiply(mat4.create(), camera.proj, camera.view)
  const inverse = mat4.invert(mat4.create(), viewProjection)
  if (!inverse || !Array.from(inverse).every(Number.isFinite))
    throw new Error("Cannot unproject error labels with this camera")
  const renderWidth = width * supersampling
  const renderHeight = height * supersampling
  const debugPoints = lines.map((label, row) => {
    // drawDebugPoints places label text at marker + (0.6, -1.1) * fontSize.
    const pixelX = margin * supersampling
    const pixelY =
      (firstTextY + row * rowHeight + finalFont * 1.1) * supersampling
    const point = vec4.fromValues(
      (pixelX / (renderWidth - 1)) * 2 - 1,
      1 - (pixelY / (renderHeight - 1)) * 2,
      0,
      1,
    )
    vec4.transformMat4(point, point, inverse)
    return {
      label,
      position: {
        x: point[0] / point[3],
        y: point[1] / point[3],
        z: point[2] / point[3],
      },
    }
  })
  return { debugPoints, debugFontSize: scaledFont }
}
