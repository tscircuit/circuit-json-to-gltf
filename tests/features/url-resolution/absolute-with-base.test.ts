import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../../lib/index"
import type { CircuitJson } from "circuit-json"

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
    model_step_url: "https://example.com/model.step",
    size: { x: 2, y: 2, z: 2 },
    source_component_id: "U1",
    position: { x: 0, y: 0, z: 0 },
    cad_component_id: "U1",
  },
]

test("absolute model URL works even if projectBaseUrl is provided", async () => {
  try {
    await convertCircuitJsonTo3D(circuitJson, {
      projectBaseUrl: "http://localhost:3000/",
    })
  } catch (err: any) {
    expect(err.message).not.toMatch(/projectBaseUrl/)
  }
})
