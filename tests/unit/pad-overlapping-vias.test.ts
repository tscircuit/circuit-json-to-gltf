import { expect, test } from "bun:test"
import type { CircuitJson, PcbTrace } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import type { Triangle } from "../../lib/types"
import { getPadOverlappingVias } from "../../lib/utils/pad-overlapping-vias"
import { createThreeDiscFlex, DISC_PITCH } from "../../examples/three-disc-flex"
import { padOverlappingVia } from "../fixtures/pad-overlapping-via"

// Vertical ray coverage in board-local Scene3D XZ, independent of earcut ordering.
function covers(triangle: Triangle, x: number, z: number) {
  if (Math.abs(triangle.normal.y) < 0.9) return false
  const signs = triangle.vertices.map((a, i) => {
    const b = triangle.vertices[(i + 1) % 3]!
    return (b.x - a.x) * (z - a.z) - (b.z - a.z) * (x - a.x)
  })
  return signs.every((s) => s >= -1e-8) || signs.every((s) => s <= 1e-8)
}

for (const layer of ["top", "bottom"] as const) {
  test(`tented via at ${layer} pad edge has an open bore and gold walls`, async () => {
    const circuit = padOverlappingVia.map((e) =>
      e.type === "pcb_smtpad" ? { ...e, layer } : e,
    )
    const scene = await convertCircuitJsonTo3D(circuit, {
      renderBoardTextures: false,
    })
    const board = scene.boxes.find((b) => b.label !== "Via Plating")!
    const copper = scene.boxes.find((b) => b.label === "Via Plating")!
    expect(copper.color).toBe("#ffe066")
    expect(copper.center).toEqual(board.center)
    expect(copper.mesh!.triangles.length).toBeGreaterThan(0)
    for (let i = 0; i < 12; i++) {
      const x = 0.35 * Math.cos((i * Math.PI) / 6)
      const z = 0.35 * Math.sin((i * Math.PI) / 6)
      expect(board.mesh!.triangles.some((t) => covers(t, x, z))).toBe(false)
    }
    for (const normalY of [-1, 1]) {
      expect(
        board.mesh!.triangles.some(
          (t) => t.normal.y * normalY > 0.9 && covers(t, 2, 1.2),
        ),
      ).toBe(true)
    }
    // A complete circumference, not just the half inside the pad, is plated.
    const perimeter = copper.mesh!.triangles.reduce((sum, t) => {
      const [a, b, c] = t.vertices
      const area =
        Math.hypot(
          (b.y - a.y) * (c.z - a.z) - (b.z - a.z) * (c.y - a.y),
          (b.z - a.z) * (c.x - a.x) - (b.x - a.x) * (c.z - a.z),
          (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x),
        ) / 2
      return sum + area / 1.6
    }, 0)
    expect(perimeter).toBeCloseTo(Math.PI, 1)
  })
}

test("covered pads and unrelated vias remain tented; route vias use the same overlap rule", () => {
  const covered = padOverlappingVia.map((e) =>
    e.type === "pcb_smtpad" ? { ...e, is_covered_with_solder_mask: true } : e,
  )
  expect(getPadOverlappingVias(covered)).toEqual([])
  const route: PcbTrace = {
    type: "pcb_trace",
    pcb_trace_id: "trace",
    route: [
      {
        route_type: "via",
        x: 10,
        y: 5,
        from_layer: "top",
        to_layer: "bottom",
        hole_diameter: 1,
        outer_diameter: 1.5,
      },
    ],
  }
  expect(
    getPadOverlappingVias([...padOverlappingVia, route]).map(
      (v) => v.pcb_via_id,
    ),
  ).toEqual(["overlap"])
  expect(
    getPadOverlappingVias([
      ...padOverlappingVia.filter((e) => e.type !== "pcb_via"),
      route,
    ]),
  ).toHaveLength(1)
})

test("intersecting plated-hole/via drills have no wall across the merged bore", async () => {
  const circuit: CircuitJson = [
    ...padOverlappingVia,
    {
      type: "pcb_plated_hole",
      pcb_plated_hole_id: "plated",
      shape: "circle",
      x: 10.4,
      y: 5,
      hole_diameter: 1,
      outer_diameter: 1.6,
      layers: ["top", "bottom"],
    },
  ]
  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })
  const triangles = scene.boxes.flatMap((b) => b.mesh?.triangles ?? [])
  expect(triangles.some((t) => covers(t, 0, 0))).toBe(false)
  expect(
    triangles.some((t) => {
      const x = t.vertices.reduce((s, p) => s + p.x, 0) / 3
      const z = t.vertices.reduce((s, p) => s + p.z, 0) / 3
      return Math.hypot(x, z) < 0.45 && Math.abs(t.normal.y) < 0.9
    }),
  ).toBe(false)
})

test("GLB exports via plating as a standard copper material", async () => {
  const glb = (await convertCircuitJsonToGltf(padOverlappingVia, {
    format: "glb",
    includeModels: false,
    boardTextureResolution: 128,
  })) as ArrayBuffer
  const view = new DataView(glb)
  const json = JSON.parse(
    new TextDecoder().decode(new Uint8Array(glb, 20, view.getUint32(12, true))),
  )
  expect(
    json.materials.some((m: any) => {
      const c = m.pbrMetallicRoughness?.baseColorFactor
      return (
        c &&
        c[0] === 1 &&
        Math.abs(c[1] - 224 / 255) < 1e-5 &&
        Math.abs(c[2] - 102 / 255) < 1e-5
      )
    }),
  ).toBe(true)
})

test("panels preserve the same through-hole and gold plating", async () => {
  const scene = await convertCircuitJsonTo3D(
    [
      ...padOverlappingVia,
      {
        type: "pcb_panel",
        pcb_panel_id: "panel",
        thickness: 1.6,
        covered_with_solder_mask: true,
        center: { x: 10, y: 5 },
        width: 6,
        height: 4,
      },
    ],
    { renderBoardTextures: false },
  )
  const copper = scene.boxes.find((b) => b.label === "Via Plating")!
  expect(copper.color).toBe("#ffe066")
  expect(copper.mesh!.triangles.length).toBeGreaterThan(0)
  expect(scene.boxes[0]!.mesh!.triangles.some((t) => covers(t, 0, 0))).toBe(
    false,
  )
})

test("via plating follows a folded board", async () => {
  const circuit = createThreeDiscFlex()
  circuit.push(
    ...padOverlappingVia.flatMap<CircuitJson[number]>((e) => {
      if (e.type === "pcb_smtpad") return [{ ...e, x: DISC_PITCH - 0.7, y: 1 }]
      if (e.type === "pcb_via" && e.pcb_via_id === "overlap")
        return [{ ...e, x: DISC_PITCH, y: 1 }]
      return []
    }),
  )
  const scene = await convertCircuitJsonTo3D(circuit, {
    foldPcbs: true,
    renderBoardTextures: false,
  })
  const copper = scene.boxes.find((b) => b.label === "Via Plating")!
  expect(copper.color).toBe("#ffe066")
  const heights = copper.mesh!.triangles.flatMap((t) =>
    t.vertices.map((p) => p.y + copper.center.y),
  )
  expect(Math.min(...heights)).toBeCloseTo(6 - 0.075, 5)
  expect(Math.max(...heights)).toBeCloseTo(6 + 0.075, 5)
})
