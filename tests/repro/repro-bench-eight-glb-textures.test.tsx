import { beforeAll, expect, test } from "bun:test"
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas"
import tscircuitFont from "@tscircuit/alphabet/base64font"
import type { CircuitJson } from "circuit-json"
import { Circuit } from "tscircuit"
import {
  createSceneFromGLTF,
  loadGLTFWithResourcesFromURL,
  renderGLTFToPNGFromGLB,
} from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"

// Reduced from Bench Eight's blue control PCB, exported as a GLB and then
// used as PANEL_BOARD in its assembly. No supplier models or network requests.
const ControlPanel = () => (
  <board width={48} height={28} solderMaskColor="blue">
    <resistor
      name="R1"
      resistance="1k"
      footprint="0805"
      pcbX={-14}
      cadModel={null}
    />
    <resistor
      name="R2"
      resistance="1k"
      footprint="0603"
      pcbX={14}
      cadModel={null}
    />
    <trace from="R1.pin2" to="R2.pin1" pcbPath={["R1.pin2", "R2.pin1"]} />
    <silkscreentext text="BENCH EIGHT" pcbY={8} fontSize={2} />
    <silkscreentext text="CONTROL PANEL" pcbY={-8} fontSize={1.5} />
  </board>
)

const dataUrl = (glb: ArrayBuffer) =>
  `data:model/gltf-binary;base64,${Buffer.from(glb).toString("base64")}`
const readScene = async (glb: ArrayBuffer) => {
  const { gltf, resources } = await loadGLTFWithResourcesFromURL(dataUrl(glb))
  return createSceneFromGLTF(gltf, resources)
}
let original: ArrayBuffer
let reimported: ArrayBuffer

beforeAll(async () => {
  const circuit = new Circuit()
  circuit.add(<ControlPanel />)
  await circuit.renderUntilSettled()
  const exported = await convertCircuitJsonToGltf(circuit.getCircuitJson(), {
    format: "glb",
    boardTextureResolution: 512,
  })
  if (!(exported instanceof ArrayBuffer)) throw new Error("Expected GLB")
  original = exported

  const assembly: CircuitJson = [
    {
      type: "source_component",
      source_component_id: "panel_source",
      name: "PANEL_BOARD",
      ftype: "simple_chip",
    },
    {
      type: "cad_component",
      cad_component_id: "panel_cad",
      source_component_id: "panel_source",
      model_glb_url: dataUrl(original),
      position: { x: 0, y: 0, z: 0 },
      // Original GLB is Y-up; Circuit JSON is Z-up. This is the placement
      // used by Bench Eight's PANEL_BOARD; both renders land in Y-up again.
      rotation: { x: 90, y: 180, z: 0 },
      model_origin_position: { x: 0, y: 0, z: 0 },
    },
  ]
  const result = await convertCircuitJsonToGltf(assembly, { format: "glb" })
  if (!(result instanceof ArrayBuffer)) throw new Error("Expected GLB")
  reimported = result
}, 30_000)

test("Bench Eight control PCB before and after GLB reimport", async () => {
  const source = await readScene(original)
  // Ensure the control really contains textured board faces.
  expect(
    source.drawCalls.filter((call) => call.material.baseColorTexture),
  ).toHaveLength(2)
  const imported = await readScene(reimported)
  expect(imported.drawCalls.length).toBeGreaterThan(0)

  GlobalFonts.register(Buffer.from(tscircuitFont, "base64"), "ReproFont")
  const canvas = createCanvas(1200, 500)
  const context = canvas.getContext("2d")
  context.fillStyle = "#edf2f5"
  context.fillRect(0, 0, 1200, 500)
  context.font = "20px ReproFont"
  context.fillStyle = "#172c3a"
  for (const [i, glb] of [original, reimported].entries()) {
    const png = await renderGLTFToPNGFromGLB(glb, {
      width: 600,
      height: 420,
      camPos: [40, 65, -55],
      lookAt: [0, 0, 0],
      fov: 35,
      backgroundColor: "#edf2f5",
    })
    context.drawImage(await loadImage(png), i * 600, 80)
    context.fillText(
      i === 0
        ? "Original control PCB GLB"
        : "Same GLB reimported into assembly",
      i * 600 + 20,
      30,
    )
    context.fillText(
      i === 0
        ? "Blue board, trace and labels visible"
        : "Board surface texture is missing",
      i * 600 + 20,
      60,
    )
  }
  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
  )
}, 30_000)

test.failing("GLB reimport preserves the two board surface textures", async () => {
  const scene = await readScene(reimported)
  expect(
    scene.drawCalls.filter((call) => call.material.baseColorTexture),
  ).toHaveLength(2)
})
