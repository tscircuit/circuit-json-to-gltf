import type { RenderOptionsInput } from "poppygl"
import { convertCircuitJsonTo3D, convertSceneToGLTF } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import type { Box3D, Point3 } from "../../lib/types"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { svgToPng } from "../../lib/utils/svg-to-png"
import { renderGlbToPng } from "../renderGlbToPng"
import { footprinterCircuit } from "./footprinter-xyz"
import { handColors, rightHandCases, type HandAxis } from "./right-hand-model"

/**
 * Fixed world reference, independent of the CAD occurrence.
 * Like circuit-to-3d's board center, Circuit XYZ -> Scene (x,z,y), then the
 * builder's final X mirror gives glTF (-x,z,y). No reference rotations.
 */
function handReference(): Box3D[] {
  const boxes: Box3D[] = []
  for (let i = -8; i <= 8; i++) {
    boxes.push(
      {
        center: { x: i, y: -8, z: 0 },
        size: { x: 0.025, y: 0.025, z: 16 },
        color: "#dbe1e7",
      },
      {
        center: { x: 0, y: -8, z: i },
        size: { x: 16, y: 0.025, z: 0.025 },
        color: "#dbe1e7",
      },
    )
  }
  boxes.push(
    {
      center: { x: 3.7, y: 0, z: 0 },
      size: { x: 7.4, y: 0.065, z: 0.065 },
      color: "#c62828",
    },
    {
      center: { x: 0, y: 0, z: 3.7 },
      size: { x: 0.065, y: 0.065, z: 7.4 },
      color: "#228b22",
    },
    {
      center: { x: 0, y: 3.7, z: 0 },
      size: { x: 0.065, y: 7.4, z: 0.065 },
      color: "#1565c0",
    },
  )
  return boxes
}

// The exact same final-glTF camera is used for all six views and both revisions.
const camera = {
  width: 780,
  height: 760,
  fov: 34,
  camPos: [-24, 21, 28],
  lookAt: [0, -1.3, 0],
  up: "y+",
  grid: false,
  backgroundColor: "#ffffff",
  debugFontSize: 26,
  debugLabelColor: [0.08, 0.1, 0.14],
  debugPointColor: [0.08, 0.1, 0.14],
  debugPoints: [
    { label: "+X", position: { x: -8.1, y: 0, z: 0 } },
    { label: "+Y", position: { x: 0, y: 0, z: 8.1 } },
    { label: "+Z", position: { x: 0, y: 8.1, z: 0 } },
  ],
} satisfies RenderOptionsInput

async function renderPose(axis: HandAxis, degrees: number) {
  const rotation: Point3 = { x: 0, y: 0, z: 0 }
  rotation[axis] = degrees
  const circuit = footprinterCircuit(rotation, {
    footprinter_string: `test-only-right-hand-${axis}`,
    position: { x: 0, y: 0, z: 0 },
  })
  // This is the REAL loadFootprinterModel -> generated GLB -> parse ->
  // occurrence placement path. References are appended only after conversion.
  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: true,
    textureResolution: 0,
  })
  if (!scene.boxes.some((box) => box.mesh?.triangles.length)) {
    throw new Error("Synthetic footprinter model did not traverse the loader")
  }
  scene.boxes.push(...handReference())
  const glb = await convertSceneToGLTF(scene, { binary: true })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
  const mesh = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
  const direction = (finger: "thumb" | "index" | "middle") => {
    const rgb = [1, 3, 5].map((offset) =>
      Number.parseInt(handColors[finger].slice(offset, offset + 2), 16),
    )
    const triangles = mesh.triangles.filter(
      ({ color }) =>
        Array.isArray(color) &&
        rgb.every((channel, i) => Math.abs(channel - color[i]!) < 1),
    )
    if (!triangles.length)
      throw new Error(`Missing exported ${finger} geometry`)
    const bounds = boundsOfTriangles(triangles)
    const longAxis = (["x", "y", "z"] as const).reduce((a, b) =>
      bounds.max[a] - bounds.min[a] > bounds.max[b] - bounds.min[b] ? a : b,
    )
    // Construction checks pin that colored distal segments point away from
    // the datum along their long axis. Read that axis from actual GLB vertices,
    // then undo ONLY the world frame mapping (-x,z,y), not any CAD rotation.
    const midpoint = (bounds.min[longAxis] + bounds.max[longAxis]) / 2
    const circuitAxis = { x: "X", y: "Z", z: "Y" }[longAxis]
    const sign = midpoint * (longAxis === "x" ? -1 : 1) > 0 ? "+" : "-"
    return `${sign}${circuitAxis}`
  }
  return {
    image: Buffer.from(await renderGlbToPng(glb, circuit, camera)).toString(
      "base64",
    ),
    thumb: direction("thumb"),
    index: direction("index"),
    middle: direction("middle"),
  }
}

export async function renderRightHandPair(axis: HandAxis) {
  const fixture = rightHandCases.find((entry) => entry.axis === axis)!
  const initial = await renderPose(axis, 0)
  const rotated = await renderPose(axis, 90)
  const rotation = ["x", "y", "z"]
    .map((component) => (component === axis ? "+90" : "0"))
    .join(", ")
  return svgToPng(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1560" height="1100">
      <rect width="1560" height="1100" fill="white"/>
      <image x="0" y="180" width="780" height="760" href="data:image/png;base64,${initial.image}"/>
      <image x="780" y="180" width="780" height="760" href="data:image/png;base64,${rotated.image}"/>
      <path d="M780 150 V930" stroke="#dbe1e7"/>
      <g font-family="sans-serif" fill="#17212e">
        <text x="24" y="40" font-size="30" font-weight="bold">RIGHT HAND: positive rotation about +${axis.toUpperCase()}</text>
        <text x="24" y="78" font-size="23">Expected rule: ${fixture.index} goes to ${fixture.middle}; thumb centerline stays on +${axis.toUpperCase()}.</text>
        <text x="24" y="112" font-size="20">Index = first vector; middle = second; thumb = index cross middle.</text>
        <text x="24" y="154" font-size="23">INITIAL: rotation (x, y, z) = (0, 0, 0) deg</text>
        <text x="804" y="154" font-size="23">EXPORTED: (${rotation}) deg</text>
        <text x="24" y="184" font-size="19">Thumb +${axis.toUpperCase()}, index ${fixture.index}, middle ${fixture.middle}</text>
        <text x="804" y="184" font-size="19">Actual exporter result, not a corrected illustration</text>
        <text x="24" y="222" font-size="21">Measured: index ${initial.index}, thumb ${initial.thumb}</text>
        <text x="804" y="222" font-size="21">Measured: index ${rotated.index}, thumb ${rotated.thumb}</text>
        <text x="24" y="960" font-size="21" fill="${handColors.thumb}">THUMB</text>
        <text x="230" y="960" font-size="21" fill="${handColors.index}">INDEX</text>
        <text x="420" y="960" font-size="21" fill="${handColors.middle}">MIDDLE</text>
        <text x="650" y="960" font-size="21" fill="${handColors.ring}">RING (curled)</text>
        <text x="970" y="960" font-size="21" fill="${handColors.pinky}">PINKY (curled)</text>
        <text x="24" y="996" font-size="20">World: Circuit JSON XYZ, right-handed, Z-up, mm. +X red; +Y green; +Z blue.</text>
        <text x="24" y="1028" font-size="20">Fixed XY grid: Z = -8 mm, 1 mm spacing. Origin (0, 0, 0) on thumb centerline. Same camera.</text>
        <text x="24" y="1060" font-size="20">Positive right-hand rotation, not a change of handedness. Mixed Euler order is a separate issue.</text>
        <text x="24" y="1088" font-size="16">Test-only native generator; real footprinter loader, GLB round-trip and occurrence placement.</text>
      </g>
    </svg>`,
  )
}

if (import.meta.main) {
  const fixture = rightHandCases.find((entry) => entry.axis === process.argv[2])
  const output = process.argv[3]
  if (!fixture || !output)
    throw new Error(
      "Usage: render-right-hand.ts x|y|z output.png (with right-hand-preload.ts)",
    )
  await Bun.write(output, await renderRightHandPair(fixture.axis))
}
