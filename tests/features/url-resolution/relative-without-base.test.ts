import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../../lib/index"

const circuitJson: CircuitJson = [
  {
    type: "pcb_component",
    pcb_component_id: "U1",
    source_component_id: "U1",
    center: { x: 0, y: 0 },
    width: 2,
    height: 2,
    layer: "top",
    rotation: 0,
    obstructs_within_bounds: true,
  },
  {
    type: "cad_component",
    pcb_component_id: "U1",
    model_step_url: "./relative-model.step",
    size: { x: 2, y: 2, z: 2 },
    cad_component_id: "U1",
    position: { x: 0, y: 0, z: 0 },
    source_component_id: "U1",
  },
]

test("relative model URL throws without projectBaseUrl", async () => {
  const [result, error] = await convertCircuitJsonTo3D(circuitJson)
    .then((result) => [result, null] as const)
    .catch((error) => [null, error] as const)

  expect(result).toBeNull()
  expect(error).toBeInstanceOf(Error)
  expect(error?.message).toMatchInlineSnapshot(
    `"Relative model URL "./relative-model.step" requires projectBaseUrl to be set in CircuitTo3DOptions."`,
  )
})
