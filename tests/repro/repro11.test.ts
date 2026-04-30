import { expect, test } from "bun:test"
import type { CircuitJson, PCBPlatedHole } from "circuit-json"
import * as fs from "node:fs"
import * as path from "node:path"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"

test("repro11 circuit 11 3d snapshot", async () => {
  const circuitPath = path.join(__dirname, "../../circuit (11).json")
  const circuitData = fs.readFileSync(circuitPath, "utf-8")
  const circuitJson: CircuitJson = JSON.parse(circuitData)
  const interiorPlatedHole: PCBPlatedHole = {
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

  circuitJson.push(interiorPlatedHole)

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 1024,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(
      glb as ArrayBuffer,
      getBestCameraPosition(circuitJson),
    ),
  ).toMatchPngSnapshot(import.meta.path, "repro11-circuit-11")
})
