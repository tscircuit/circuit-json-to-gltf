import { expect, test } from "bun:test"
import type { CadCable, Point3 } from "circuit-json"
import { loadCable } from "../../lib/loaders/cable"

test("plugs consume resolved absolute pin 1 points without source or footprint context", () => {
  const legacy: CadCable = {
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
  for (const mirrored of [false, true]) {
    for (const angle of [0, 35, 90, 180, 270]) {
      const position = (rotation: number, z: number): Point3 => {
        const radians = (rotation * Math.PI) / 180
        const offset = mirrored ? 5 : -5
        return {
          x: 7 + Math.cos(radians) * offset,
          y: 11 + Math.sin(radians) * offset,
          z,
        }
      }
      const cable: CadCable = {
        ...legacy,
        // Pin 1 is on each mating face, displaced axially from the path's
        // wire exit. Absolute coordinates include a nonzero translation.
        from_connector_pin1_position: position(angle, -6.85),
        to_connector_pin1_position: position(angle + 90, 36.85),
      }
      const boxes = loadCable(cable)
      for (const [end, rotation, pin1] of [
        ["A", angle, cable.from_connector_pin1_position!],
        ["B", angle + 90, cable.to_connector_pin1_position!],
      ] as const) {
        const housing = boxes.find(
          (box) => box.label === `PH / ${end}-housing`,
        )!
        const radians = (rotation * Math.PI) / 180
        // Circuit Y maps to scene Z. Measure emitted geometry, not the helper.
        const projection = housing.mesh!.triangles.flatMap((triangle) =>
          triangle.vertices.map(
            (vertex) =>
              vertex.x * Math.cos(radians) + vertex.z * Math.sin(radians),
          ),
        )
        expect(Math.max(...projection) - Math.min(...projection)).toBeCloseTo(
          13.8,
          5,
        )
        const wire = boxes.find((box) => box.label === "PH / wire-1")!
        const cap = wire
          .mesh!.triangles.flatMap((triangle) => triangle.vertices)
          .filter(
            (vertex) => Math.abs(vertex.y - (end === "A" ? 0 : 30)) < 1e-6,
          )
        for (const [axis, expected] of [
          ["x", pin1.x],
          ["z", pin1.y],
        ] as const) {
          const values = cap.map((vertex) => vertex[axis])
          expect((Math.min(...values) + Math.max(...values)) / 2).toBeCloseTo(
            expected,
            5,
          )
        }
      }
    }
  }
  const legacyEnd = loadCable(legacy).find(
    (box) => box.label === "PH / B-housing",
  )!
  expect(legacyEnd.size.x).toBeCloseTo(13.8, 6)
  expect(legacyEnd.size.z).toBeCloseTo(4.5, 6)
})
