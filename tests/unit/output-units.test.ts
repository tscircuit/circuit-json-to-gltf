import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { convertCircuitJsonToGltf as browserExport } from "../../lib/browser"
import { convertCircuitJsonToGltf as browserIndexExport } from "../../lib/browser-index"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"
import type { GLTF } from "../../lib/gltf/gltf-types"
import { parseGLB } from "../../lib/loaders/glb"
import { assemblyExplosion } from "../fixtures/assembly-explosion"

// Exact P02_UpperJaw OBJ from the real gimbal: 128 x 15 x 70 mm in CAD XYZ.
const jawObj = Bun.gunzipSync(
  await Bun.file(
    new URL("../assets/gimbal-upper-jaw.obj.gz", import.meta.url),
  ).bytes(),
)
const jawCircuit: CircuitJson = [
  {
    type: "source_component",
    source_component_id: "jaw",
    ftype: "printedpart",
    name: "P02_UpperJaw",
  },
  {
    type: "cad_component",
    cad_component_id: "jaw_cad",
    source_component_id: "jaw",
    model_obj_url: `data:text/plain;base64,${Buffer.from(jawObj).toString("base64")}`,
    model_origin_position: { x: 0, y: 0, z: 0 },
    position: { x: 12, y: 34, z: 56 },
    rotation: { x: 0, y: 0, z: 0 },
    anchor_alignment: "center",
    model_object_fit: "contain_within_bounds",
  },
]

test("output units default to millimeters", async () => {
  const original = await convertCircuitJsonToGltf(jawCircuit, { format: "glb" })
  const millimeters = await convertCircuitJsonToGltf(jawCircuit, {
    format: "glb",
    outputUnits: "mm",
  })
  if (
    !(original instanceof ArrayBuffer) ||
    !(millimeters instanceof ArrayBuffer)
  )
    throw new Error("Expected binary GLB output")
  expect(new Uint8Array(millimeters)).toEqual(new Uint8Array(original))
  const { min, max } = parseGLB(original).boundingBox
  expect(max.x - min.x).toBeCloseTo(128)
})

test("meter output keeps an empty scene free of invalid empty child lists", async () => {
  const gltf = (await convertSceneToGLTF(
    { boxes: [] },
    { outputUnits: "m" },
  )) as GLTF
  expect(gltf.nodes).toEqual([])
})

test("meter GLB export preserves the jaw's physical size and translated placement", async () => {
  const glb = await convertCircuitJsonToGltf(jawCircuit, {
    format: "glb",
    outputUnits: "m",
  })
  if (!(glb instanceof ArrayBuffer))
    throw new Error("Expected binary GLB output")
  const { min, max } = parseGLB(glb).boundingBox
  expect(max.x - min.x).toBeCloseTo(0.128, 7)
  expect(max.y - min.y).toBeCloseTo(0.015, 7)
  expect(max.z - min.z).toBeCloseTo(0.07, 7)
  expect(min.x).toBeCloseTo(-0.076, 7)
  expect(min.y).toBeCloseTo(0.066, 7)
  expect(min.z).toBeCloseTo(0.021, 7)
})

test("browser export honors meter output units", async () => {
  const glb = await browserExport(jawCircuit, {
    format: "glb",
    outputUnits: "m",
  })
  if (!(glb instanceof ArrayBuffer))
    throw new Error("Expected binary GLB output")
  const { min, max } = parseGLB(glb).boundingBox
  expect(max.x - min.x).toBeCloseTo(0.128, 7)
})

test("browser-index export honors meter output units", async () => {
  const glb = await browserIndexExport(jawCircuit, {
    format: "glb",
    outputUnits: "m",
  })
  if (!(glb instanceof ArrayBuffer))
    throw new Error("Expected binary GLB output")
  const { min, max } = parseGLB(glb).boundingBox
  expect(max.x - min.x).toBeCloseTo(0.128, 7)
})

test("meter glTF export scales world-space explosion lines with its geometry", async () => {
  const gltf = (await convertCircuitJsonToGltf(assemblyExplosion, {
    format: "gltf",
    outputUnits: "m",
    explosion: {
      throughStageRef: "assembly.lift-bolts",
      stageProgress: 0.25,
    },
  })) as GLTF
  expect(gltf.scenes![0]!.extras!.poppygl!.explosionLines![0]!.points).toEqual([
    [-0.006, 0.002, 0.007],
    [-0.006, 0.007, 0.007],
  ])
})
