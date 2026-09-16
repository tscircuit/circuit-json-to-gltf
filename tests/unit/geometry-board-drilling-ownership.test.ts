import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { prepareBoardGeometry } from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("mechanical drilling rejects unrelated ancestry without changing legacy scene rendering", async () => {
  const circuitJson = geometryCircuit()
  circuitJson.push({
    type: "pcb_hole",
    pcb_hole_id: "hole",
    x: 0,
    y: 0,
    hole_shape: "circle",
    hole_diameter: 2,
    subcircuit_id: "unrelated",
  })
  await expect(
    prepareBoardGeometry({ circuitJson, pcbBoardId: "board" }),
  ).rejects.toThrow("Ambiguous board ownership for drilled geometry")
  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
  })
  expect(scene.boxes[0]?.mesh?.triangles.length).toBeGreaterThan(12)
})
