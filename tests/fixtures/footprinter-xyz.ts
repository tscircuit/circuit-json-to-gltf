import { Resvg } from "@resvg/resvg-js"
import type { CadComponent, CircuitJson } from "circuit-json"
import type { RenderOptionsInput } from "poppygl"
import {
  convertCircuitJsonTo3D,
  convertCircuitJsonToGltf,
  convertSceneToGLTF,
} from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import type { Box3D, ConversionOptions, Point3 } from "../../lib/types"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { renderGlbToPng } from "../renderGlbToPng"

export const footprinterRotationCases = [
  { name: "zero", rotation: { x: 0, y: 0, z: 0 } },
  { name: "z47", rotation: { x: 0, y: 0, z: 47 } },
  { name: "bottom-y180-z-negative", rotation: { x: 0, y: 180, z: -47 } },
  { name: "x30", rotation: { x: 30, y: 0, z: 0 } },
  { name: "y30", rotation: { x: 0, y: 30, z: 0 } },
  { name: "xyz23-31-47", rotation: { x: 23, y: 31, z: 47 } },
  { name: "x-negative30", rotation: { x: -30, y: 0, z: 0 } },
]

export function footprinterCircuit(
  rotation: Point3,
  overrides: Partial<CadComponent> = {},
): CircuitJson {
  return [
    {
      type: "cad_component",
      cad_component_id: "cad-soic",
      pcb_component_id: "pcb-soic",
      source_component_id: "source-soic",
      footprinter_string: "soic8",
      position: { x: 7, y: -4, z: 3 },
      rotation,
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
      model_origin_position: { x: 0, y: 0, z: 0 },
      // No size: native mm geometry, not a fit-to-bounds experiment.
      ...overrides,
    },
  ]
}

export async function exportFootprinter(
  circuit: CircuitJson,
  options: ConversionOptions = {},
) {
  const glb = await convertCircuitJsonToGltf(circuit, {
    format: "glb",
    boardTextureResolution: 0,
    ...options,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
  return {
    glb,
    mesh: parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY),
  }
}

// Fixed glTF Y-up perspective for every case and both exporter revisions.
export const footprinterCamera = {
  width: 960,
  height: 680,
  fov: 30,
  camPos: [7.85, 14.88, 15.305],
  lookAt: [-7, 3, -4],
  up: "y+",
  grid: false,
  backgroundColor: "#ffffff",
} satisfies RenderOptionsInput

/**
 * Stationary reference in Scene3D's intermediate Y-up frame, mm.
 * Like circuit-to-3d's board center, Circuit JSON (x,y,z) becomes (x,z,y);
 * GLTFBuilder.toGltfTranslation/convertMeshToGLTFOrientation then mirror X.
 * The final reference therefore follows (x,y,z) -> (-x,z,y), not the chip's
 * format-specific rotation path. This is a datum plane, NOT a PCB surface.
 */
function footprinterReference(): Box3D[] {
  const boxes: Box3D[] = []
  for (let offset = -5; offset <= 5; offset++) {
    const color = Math.abs(offset) === 5 ? "#9aa6b2" : "#d4dbe2"
    boxes.push(
      {
        center: { x: 7, y: 3, z: -4 + offset },
        size: { x: 10, y: 0.025, z: 0.025 },
        color,
      },
      {
        center: { x: 7 + offset, y: 3, z: -4 },
        size: { x: 0.025, y: 0.025, z: 10 },
        color,
      },
    )
  }
  boxes.push(
    {
      label: "Circuit JSON +X",
      center: { x: 10, y: 3, z: -4 },
      size: { x: 6, y: 0.08, z: 0.08 },
      color: "#c62828",
    },
    {
      label: "Circuit JSON +Y",
      center: { x: 7, y: 3, z: -1 },
      size: { x: 0.08, y: 0.08, z: 6 },
      color: "#228b22",
    },
    {
      label: "Circuit JSON +Z",
      center: { x: 7, y: 6, z: -4 },
      size: { x: 0.08, y: 6, z: 0.08 },
      color: "#1565c0",
    },
  )
  return boxes
}

/** Visual-only reference and captions; analytical exports stay model-only. */
export async function renderFootprinterRotation(rotation: Point3) {
  const circuit = footprinterCircuit(rotation)
  // Same model pipeline/options as exportFootprinter; add references only
  // after component conversion, so no reference can inherit CAD rotation.
  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: true,
    textureResolution: 0,
  })
  scene.boxes.push(...footprinterReference())
  const glb = await convertSceneToGLTF(scene, { binary: true })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
  const png = await renderGlbToPng(glb, circuit, {
    ...footprinterCamera,
    debugFontSize: 28,
    debugLabelColor: [0.08, 0.1, 0.14],
    debugPointColor: [0.08, 0.1, 0.14],
    // Positions are final glTF world coordinates, NOT screen directions.
    debugPoints: [
      { label: "+X", position: { x: -13, y: 3, z: -4 } },
      { label: "+Y", position: { x: -7, y: 3, z: 3.5 } },
      { label: "+Z", position: { x: -7, y: 9, z: -4 } },
    ],
  } satisfies RenderOptionsInput)
  const image = Buffer.from(png).toString("base64")
  return new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="960" height="890">
      <rect width="960" height="890" fill="white"/>
      <image x="0" y="115" width="960" height="680" href="data:image/png;base64,${image}"/>
      <g font-family="sans-serif" fill="#17212e">
        <text x="24" y="34" font-size="26" font-weight="bold">SOIC8 native-origin rotation</text>
        <text x="24" y="68" font-size="24">rotation.x = ${rotation.x} deg</text>
        <text x="330" y="68" font-size="24">rotation.y = ${rotation.y} deg</text>
        <text x="636" y="68" font-size="24">rotation.z = ${rotation.z} deg</text>
        <text x="24" y="100" font-size="19">Input angles in DEGREES, about Circuit JSON axes (Z-up; lengths in mm).</text>
        <text x="24" y="812" font-size="19">Fixed XY reference: world Z = 3 mm; 1 mm grid. NOT a board or seating surface.</text>
        <text x="24" y="840" font-size="19">Axes meet at CAD rotation datum (7, -4, 3) mm; native model origin = (0, 0, 0).</text>
        <text x="24" y="868" font-size="19">Circuit JSON axes: +X red, +Y green, +Z blue. Same camera and datum in every image.</text>
      </g>
    </svg>`,
  )
    .render()
    .asPng()
}
