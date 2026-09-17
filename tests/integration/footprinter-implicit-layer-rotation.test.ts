import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import {
  exportFootprinter,
  footprinterCircuit,
} from "../fixtures/footprinter-xyz"

test.each(["top" as const, "bottom" as const])(
  "footprinter without CAD rotation keeps its implicit %s placement",
  async (layer) => {
    const rotation = { x: 0, y: layer === "bottom" ? 180 : 0, z: 0 }
    const pcb: CircuitJson = [
      {
        type: "pcb_component",
        pcb_component_id: "pcb-soic",
        source_component_id: "source-soic",
        center: { x: 7, y: -4 },
        width: 6,
        height: 5,
        rotation: 0,
        obstructs_within_bounds: true,
        layer,
      },
    ]
    const explicit = await exportFootprinter([
      ...pcb,
      ...footprinterCircuit(rotation),
    ])
    const implicit = await exportFootprinter([
      ...pcb,
      ...footprinterCircuit(rotation, { rotation: undefined }),
    ])
    expect(implicit.mesh.triangles.length).toBe(explicit.mesh.triangles.length)
    for (const [i, triangle] of implicit.mesh.triangles.entries()) {
      const reference = explicit.mesh.triangles[i]!
      const points = [...triangle.vertices, triangle.normal]
      const expected = [...reference.vertices, reference.normal]
      for (const [j, point] of points.entries()) {
        for (const axis of ["x", "y", "z"] as const) {
          expect(point[axis]).toBeCloseTo(expected[j]![axis], 5)
        }
      }
    }
  },
)
