import {
  glyphWidthRatio,
  lineAlphabet,
  lineHeightRatio,
  strokeWidthRatio,
} from "@tscircuit/alphabet"
import type { CircuitJson } from "circuit-json"
import {
  createBoxMesh,
  createMeshFromSTL,
  transformMesh,
} from "../gltf/geometry"
import type {
  Box3D,
  CircuitJsonWithPcbFlex,
  Point3,
  Scene3D,
  Triangle,
} from "../types"
import { boundsOfPositions, boundsOfTriangles } from "./bounding-box"

type CircuitJsonError = Extract<
  CircuitJson[number],
  { error_type: string; message: string }
>
type GlyphSegment = { x1: number; y1: number; x2: number; y2: number }

const punctuation: Record<string, GlyphSegment[]> = {
  ":": [
    { x1: 0.3, y1: 0.2, x2: 0.3, y2: 0.2 },
    { x1: 0.3, y1: 0.55, x2: 0.3, y2: 0.55 },
  ],
  ";": [
    { x1: 0.3, y1: 0.55, x2: 0.3, y2: 0.55 },
    { x1: 0.3, y1: 0.2, x2: 0.2, y2: 0.05 },
  ],
  "?": [
    { x1: 0.08, y1: 0.65, x2: 0.25, y2: 0.75 },
    { x1: 0.25, y1: 0.75, x2: 0.5, y2: 0.65 },
    { x1: 0.5, y1: 0.65, x2: 0.5, y2: 0.5 },
    { x1: 0.5, y1: 0.5, x2: 0.3, y2: 0.35 },
    { x1: 0.3, y1: 0.35, x2: 0.3, y2: 0.25 },
    { x1: 0.3, y1: 0.08, x2: 0.3, y2: 0.08 },
  ],
}

/** Preserve unsupported glyphs as readable Unicode escapes instead of dropping
 * message characters. The original message remains the exported node name. */
function escapeUnsupportedGlyphs(message: string): string {
  return Array.from(message)
    .map((character) =>
      character === " " ||
      character === "\n" ||
      lineAlphabet[character] ||
      punctuation[character]
        ? character
        : `[U+${character.codePointAt(0)!.toString(16).toUpperCase()}]`,
    )
    .join("")
}

function wrapMessage(message: string, columns: number): string[] {
  return escapeUnsupportedGlyphs(message)
    .split("\n")
    .flatMap((paragraph) => {
      const lines: string[] = []
      let remaining = paragraph
      while (remaining.length > columns) {
        const space = remaining.lastIndexOf(" ", columns)
        const split = space > 0 ? space : columns
        lines.push(remaining.slice(0, split))
        remaining = remaining.slice(split).replace(/^ /, "")
      }
      lines.push(remaining)
      return lines
    })
}

/** Scene3D world bounds (+Y up, mm). Apply the same geometry and rotation as
 * GLTFBuilder.addBox, including rotated CAD and all eight corners of boxes. */
function sceneBounds(boxes: Box3D[]) {
  const positions = boxes.flatMap((box) => {
    const geometry = box.mesh
      ? createMeshFromSTL(box.mesh)
      : createBoxMesh(box.size)
    return transformMesh(geometry, box.center, box.rotation).positions
  })
  return boundsOfPositions(positions)
}

/** Draw alphabet strokes as solid, two-sided triangles in Scene3D (+Y up, mm).
 * Glyph +X is Scene3D +X and glyph +Y is Scene3D +Z. This matches the PCB top
 * face: GLTFBuilder.toGltfTranslation/convertMeshToGLTFOrientation reflects X
 * once, so glyph advance is glTF -X, screen-right when viewed from -Z/+Y.
 */
function createTextBox(
  lines: string[],
  center: Point3,
  fontSize: number,
  width: number,
  label: string,
): Box3D {
  const triangles: Triangle[] = []
  for (const [lineIndex, text] of lines.entries()) {
    for (const [characterIndex, character] of Array.from(text).entries()) {
      const segments = lineAlphabet[character] ?? punctuation[character] ?? []
      const xOffset = -width / 2 + characterIndex * glyphWidthRatio * fontSize
      const zOffset = -lineIndex * lineHeightRatio * fontSize
      for (const segment of segments) {
        const dx = segment.x2 - segment.x1
        const dz = segment.y2 - segment.y1
        const length = Math.hypot(dx, dz)
        const halfStroke = strokeWidthRatio / 2
        const px = length ? (-dz / length) * halfStroke : -halfStroke
        const pz = length ? (dx / length) * halfStroke : 0
        const point = (x: number, z: number): Point3 => ({
          x: xOffset + x * fontSize,
          y: 0,
          z: zOffset + z * fontSize,
        })
        const endZ = segment.y2 + (length ? 0 : strokeWidthRatio)
        const vertices = [
          point(segment.x1 + px, segment.y1 + pz),
          point(segment.x2 + px, endZ + pz),
          point(segment.x2 - px, endZ - pz),
          point(segment.x1 - px, segment.y1 - pz),
        ]
        for (const [a, b, c] of [
          [0, 1, 2],
          [0, 2, 3],
        ]) {
          // Match createMeshFromSTL's clockwise source triangles; that adapter
          // reverses indices before the canonical glTF frame conversion.
          const front = [vertices[a!]!, vertices[c!]!, vertices[b!]!] as [
            Point3,
            Point3,
            Point3,
          ]
          triangles.push({ vertices: front, normal: { x: 0, y: 1, z: 0 } })
          triangles.push({
            vertices: [front[0], front[2], front[1]],
            normal: { x: 0, y: -1, z: 0 },
          })
        }
      }
    }
  }
  const boundingBox = boundsOfTriangles(triangles)
  return {
    center,
    size: {
      x: width,
      y: 0,
      z: Math.max(lines.length * lineHeightRatio * fontSize, fontSize),
    },
    color: "#fff0f0",
    label,
    mesh: { triangles, boundingBox },
  }
}

/** Add full Circuit JSON error messages as a flat scene annotation outside the
 * rendered geometry. Errors without coordinates are equally visible. The card
 * intentionally remains outside the PCB fold; it describes the resulting scene.
 * The input Circuit JSON and original scene are never mutated.
 */
export function withCircuitJsonErrorOverlay(
  scene: Scene3D,
  circuitJson: CircuitJsonWithPcbFlex,
): Scene3D {
  const errors = circuitJson.filter(
    (element): element is CircuitJsonError =>
      "error_type" in element &&
      typeof element.error_type === "string" &&
      "message" in element &&
      typeof element.message === "string",
  )
  if (!errors.length) return scene

  const bounds = sceneBounds(scene.boxes)
  const width = Math.max(bounds.max.x - bounds.min.x, 30)
  const fontSize = width / (44 * glyphWidthRatio)
  const padding = fontSize
  const textWidth = width - padding * 2
  const columns = Math.floor(textWidth / (fontSize * glyphWidthRatio))
  const messages = errors.map((error, index) => ({
    error,
    lines: wrapMessage(`${index + 1}. ${error.message}`, columns),
  }))
  const totalLines =
    1 + messages.reduce((count, message) => count + message.lines.length + 1, 0)
  const height = totalLines * lineHeightRatio * fontSize + padding * 2
  const center = {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: Math.max(bounds.min.y, 0) + 0.1,
    z: bounds.min.z - padding * 2 - height / 2,
  }
  const textCenter = {
    ...center,
    y: center.y + 0.06,
    z: center.z + height / 2 - padding - fontSize,
  }
  const a = { x: -width / 2, y: 0, z: -height / 2 }
  const b = { x: width / 2, y: 0, z: -height / 2 }
  const c = { x: width / 2, y: 0, z: height / 2 }
  const d = { x: -width / 2, y: 0, z: height / 2 }
  const cardTriangles: Triangle[] = [
    { vertices: [a, b, c], normal: { x: 0, y: 1, z: 0 } },
    { vertices: [a, c, d], normal: { x: 0, y: 1, z: 0 } },
    { vertices: [a, c, b], normal: { x: 0, y: -1, z: 0 } },
    { vertices: [a, d, c], normal: { x: 0, y: -1, z: 0 } },
  ]
  const overlays: Box3D[] = [
    {
      center,
      size: { x: width, y: 0, z: height },
      color: "#8c182a",
      label: "Circuit JSON errors",
      mesh: {
        triangles: cardTriangles,
        boundingBox: boundsOfTriangles(cardTriangles),
      },
    },
    createTextBox(
      [`Circuit JSON errors (${errors.length})`],
      textCenter,
      fontSize,
      textWidth,
      "Circuit JSON errors heading",
    ),
  ]
  let lineOffset = 2
  for (const { error, lines } of messages) {
    overlays.push(
      createTextBox(
        lines,
        {
          ...textCenter,
          z: textCenter.z - lineOffset * lineHeightRatio * fontSize,
        },
        fontSize,
        textWidth,
        error.message,
      ),
    )
    lineOffset += lines.length + 1
  }
  const boxes = [...scene.boxes, ...overlays]
  const completeBounds = sceneBounds(boxes)
  const target = {
    x: (completeBounds.min.x + completeBounds.max.x) / 2,
    y: (completeBounds.min.y + completeBounds.max.y) / 2,
    z: (completeBounds.min.z + completeBounds.max.z) / 2,
  }
  const distance =
    Math.max(
      Math.hypot(
        completeBounds.max.x - completeBounds.min.x,
        completeBounds.max.y - completeBounds.min.y,
        completeBounds.max.z - completeBounds.min.z,
      ),
      1,
    ) * 1.5
  return {
    ...scene,
    boxes,
    camera: {
      ...scene.camera,
      target,
      position: {
        x: target.x + distance * 0.5,
        y: target.y + distance * 0.9,
        z: target.z - distance * 0.5,
      },
      up: { x: 0, y: 1, z: 0 },
      far: distance * 4,
    },
  }
}
