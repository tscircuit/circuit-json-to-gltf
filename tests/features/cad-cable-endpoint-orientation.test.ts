import { expect, test } from "bun:test"
import type { CadCable } from "circuit-json"
import { loadCable } from "../../lib/loaders/cable"

test("endpoint width directions orient both plugs before the circuit-to-scene frame conversion", () => {
  const cable: CadCable = {
    type: "cad_cable",
    cad_cable_id: "cad_cable_1",
    name: "PH",
    from_source_component_id: "source_from",
    to_source_component_id: "source_to",
    cableprinter_string: "jst_ph_pins6",
    // Circuit world: +Z up, mm. Two plugs on a vertical straight path
    // have deliberately different width axes (X vs Y).
    path: [
      { x: 7, y: 11, z: 0 },
      { x: 7, y: 11, z: 30 },
    ],
    from_connector_width_direction: { x: 1, y: 0, z: 0 },
    to_connector_width_direction: { x: 0, y: 1, z: 0 },
  }
  const boxes = loadCable(cable)
  const start = boxes.find((box) => box.label === "PH / A-housing")!
  const end = boxes.find((box) => box.label === "PH / B-housing")!
  expect(start.size.x).toBeCloseTo(13.8, 6)
  // Scene3D maps circuit Y to scene Z, and circuit Z to scene Y.
  expect(end.size.z).toBeCloseTo(start.size.x, 6)
  expect(end.size.x).toBeCloseTo(start.size.z, 6)
  expect(start.mesh!.boundingBox.min.x + start.size.x / 2).toBeCloseTo(7, 6)
  expect(end.mesh!.boundingBox.min.z + end.size.z / 2).toBeCloseTo(11, 6)

  const legacy = loadCable({
    ...cable,
    from_connector_width_direction: undefined,
    to_connector_width_direction: undefined,
  })
  const legacyEnd = legacy.find((box) => box.label === "PH / B-housing")!
  expect(legacyEnd.size.x).toBeCloseTo(13.8, 6)
  expect(legacyEnd.size.z).toBeCloseTo(4.5, 6)
})
