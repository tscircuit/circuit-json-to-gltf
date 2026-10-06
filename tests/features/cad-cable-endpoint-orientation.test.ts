import { expect, test } from "bun:test"
import type { CadCable, CircuitJson } from "circuit-json"
import { loadCable } from "../../lib/loaders/cable"

test("plug widths follow footprint pins across rotations and mirrored layers without cable metadata", () => {
  const cable: CadCable = {
    type: "cad_cable",
    cad_cable_id: "cable",
    name: "PH",
    from_source_component_id: "from",
    to_source_component_id: "to",
    cableprinter_string: "jst_ph_pins6",
    path: [
      { x: 7, y: 11, z: 0 },
      { x: 7, y: 11, z: 30 },
    ],
  }
  for (const layer of ["top", "bottom"] as const) {
    for (const angle of [0, 35, 90, 180, 270]) {
      const context: CircuitJson = []
      for (const [id, rotation] of [
        ["from", angle],
        ["to", angle + 90],
      ] as const) {
        for (let pin = 1; pin <= 6; pin++) {
          const radians = (rotation * Math.PI) / 180
          const offset = (pin - 3.5) * 2 * (layer === "bottom" ? -1 : 1)
          context.push(
            {
              type: "source_port",
              source_port_id: `${id}_${pin}`,
              source_component_id: id,
              name: `pin${pin}`,
              pin_number: pin,
            },
            {
              type: "pcb_port",
              pcb_port_id: `${id}_${pin}`,
              source_port_id: `${id}_${pin}`,
              pcb_component_id: id,
              layers: [layer],
              x: 7 + Math.cos(radians) * offset,
              y: 11 + Math.sin(radians) * offset,
            },
          )
        }
      }
      const boxes = loadCable(cable, context)
      for (const [end, rotation] of [
        ["A", angle],
        ["B", angle + 90],
      ] as const) {
        const housing = boxes.find(
          (box) => box.label === `PH / ${end}-housing`,
        )!
        const radians = (rotation * Math.PI) / 180
        // Circuit Y maps to scene Z. Measure actual mesh, not inferred values.
        const projection = housing.mesh!.triangles.flatMap((t) =>
          t.vertices.map(
            (v) => v.x * Math.cos(radians) + v.z * Math.sin(radians),
          ),
        )
        expect(Math.max(...projection) - Math.min(...projection)).toBeCloseTo(
          13.8,
          5,
        )
      }
    }
  }
  // Missing footprint context preserves standalone cad_cable rendering.
  const legacyEnd = loadCable(cable).find(
    (box) => box.label === "PH / B-housing",
  )!
  expect(legacyEnd.size.x).toBeCloseTo(13.8, 6)
  expect(legacyEnd.size.z).toBeCloseTo(4.5, 6)
})
