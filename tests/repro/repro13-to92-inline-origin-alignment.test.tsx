import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { Circuit } from "tscircuit"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import to92InlineFootprint from "../assets/TO-92_Inline.json"
import { getBestCameraPosition } from "../../lib/utils/camera-position"

const KICAD_TO92_INLINE_FOOTPRINT = "kicad:Package_TO_SOT_THT/TO-92_Inline"
const TO92_INLINE_STEP_URL = "tests/assets/TO-92_Inline.step"

async function getTo92InlineCircuitJson() {
  const circuit = new Circuit({
    platform: {
      footprintLibraryMap: {
        kicad: async (footprintName: string) => {
          expect(footprintName).toBe("Package_TO_SOT_THT/TO-92_Inline")

          return {
            footprintCircuitJson: to92InlineFootprint,
            cadModel: {
              stepUrl: TO92_INLINE_STEP_URL,
            },
          }
        },
      },
    },
  } as any)

  circuit.add(
    <board width="14mm" height="14mm">
      <chip name="Q1" footprint={KICAD_TO92_INLINE_FOOTPRINT} />
    </board>,
  )

  await circuit.renderUntilSettled()
  return circuit.getCircuitJson()
}

test("repro13: TO-92 KiCad STEP model should align to the footprint origin", async () => {
  const circuitJson = await getTo92InlineCircuitJson()

  const platedHoles = circuitJson.filter(
    (element) => element.type === "pcb_plated_hole",
  )
  const cadComponent = circuitJson.find(
    (element): element is CadComponent => element.type === "cad_component",
  )

  expect(platedHoles).toHaveLength(3)
  expect(cadComponent?.model_step_url).toContain(
    "tests/assets/TO-92_Inline.step",
  )

  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
    showBoundingBoxes: false,
  })

  const componentBox = scene.boxes.find((box) => box.label === "Q1")

  expect(componentBox).toBeDefined()
  expect(componentBox?.mesh).toBeDefined()

  const mesh = componentBox!.mesh!
  const bounds = mesh.boundingBox
  const contactVertices = mesh.triangles
    .flatMap((triangle) => triangle.vertices)
    .filter((vertex) => Math.abs(vertex.y - bounds.min.y) < 1e-6)

  const contactMinX = Math.min(...contactVertices.map((vertex) => vertex.x))
  const contactMaxX = Math.max(...contactVertices.map((vertex) => vertex.x))
  const contactMinZ = Math.min(...contactVertices.map((vertex) => vertex.z))
  const contactMaxZ = Math.max(...contactVertices.map((vertex) => vertex.z))

  // The STEP model should keep its board-surface height plane while its
  // through-hole contact patch is centered on the footprint origin.
  expect(bounds.min.y).toBeCloseTo(-2.5, 6)
  expect((contactMinX + contactMaxX) / 2).toBeCloseTo(0, 6)
  expect((contactMinZ + contactMaxZ) / 2).toBeCloseTo(0, 6)
})

test("repro13: TO-92 KiCad STEP model snapshot", async () => {
  const circuitJson = await getTo92InlineCircuitJson()

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)

  expect(
    renderGLTFToPNGFromGLB(
      glb as ArrayBuffer,
      getBestCameraPosition(circuitJson),
    ),
  ).toMatchPngSnapshot(import.meta.path, "repro13-to92-inline-origin-alignment")
}, 10_000)
