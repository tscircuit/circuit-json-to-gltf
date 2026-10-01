import { expect, test } from "bun:test"
import { prepareBoardGeometry } from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("shared asset CAD occurrences remain separate and preserve native OBJ markers and colors", async () => {
  const circuit = geometryCircuit({
    model_origin_position: { x: 0, y: 0, z: 0 },
  })
  const cad = circuit.find((item) => item.type === "cad_component")!
  if (cad.type !== "cad_component") throw new Error("Missing CAD")
  circuit.push({
    ...cad,
    cad_component_id: "cad-2",
    position: { x: -4, y: 6, z: 8 },
  })
  const prepared = await prepareBoardGeometry({
    circuitJson: circuit,
    pcbBoardId: "board",
  })
  expect(prepared.components.map((item) => item.cadComponentId)).toEqual([
    "cad",
    "cad-2",
  ])
  const [first, second] = prepared.components
  if (first?.status !== "available" || second?.status !== "available")
    throw new Error("Missing geometry")
  expect(first.mesh).toEqual(second.mesh)
  expect(first.bounds).toEqual({
    min: { x: 4, y: 6, z: 3.8 },
    max: { x: 8, y: 12, z: 7.8 },
  })
  expect(second.bounds).toEqual({
    min: { x: -3, y: 8, z: 11 },
    max: { x: 1, y: 14, z: 15 },
  })
  expect(
    first.mesh.triangles.some((triangle) => triangle.color !== undefined),
  ).toBe(true)
})
