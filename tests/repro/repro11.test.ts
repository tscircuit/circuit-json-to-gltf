import { expect, test } from "bun:test"
import type { CircuitJson, PcbPlatedHole } from "circuit-json"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import circuitJson from "../assets/repro11.json"

test("repro11 circuit 11 3d snapshot", async () => {
  const interiorPlatedHole: PcbPlatedHole = {
    type: "pcb_plated_hole",
    pcb_plated_hole_id: "repro11_interior_plated_hole",
    x: 0,
    y: 0,
    hole_diameter: 0.8,
    outer_diameter: 2,
    shape: "circle",
    layers: ["top", "bottom"],
    is_covered_with_solder_mask: false,
  }

  const circuitJsonWithInteriorPlatedHole: CircuitJson = [
    ...(circuitJson as CircuitJson),
    interiorPlatedHole,
  ]

  const glb = await convertCircuitJsonToGltf(
    circuitJsonWithInteriorPlatedHole,
    {
      format: "glb",
      boardTextureResolution: 1024,
      includeModels: true,
      showBoundingBoxes: false,
    },
  )

  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(
      glb as ArrayBuffer,
      getBestCameraPosition(circuitJsonWithInteriorPlatedHole),
    ),
  ).toMatchPngSnapshot(import.meta.path, "repro11-circuit-11")
})
