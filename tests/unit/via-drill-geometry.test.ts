import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import type { CircuitJson, PcbBoard, PcbVia } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { renderBoardTextures } from "../../lib/converters/board-renderer"
import { getPcbVias } from "../../lib/utils/get-pcb-vias"
import type { STLMesh } from "../../lib/types"

const board: PcbBoard = {
  type: "pcb_board",
  pcb_board_id: "board",
  center: { x: 4, y: -3 },
  width: 20,
  height: 12,
  thickness: 1.6,
  num_layers: 2,
  material: "fr4",
  min_via_hole_diameter: 1,
  min_via_pad_diameter: 2,
  default_via_tented_on_top: true,
  default_via_tented_on_bottom: false,
}
const via: PcbVia = {
  type: "pcb_via",
  pcb_via_id: "via",
  x: 2,
  y: -4,
  hole_diameter: 1,
  outer_diameter: 2,
  layers: ["top", "bottom"],
  tented_on_bottom: true,
}
const circuit: CircuitJson = [
  board,
  via,
  {
    type: "pcb_trace",
    pcb_trace_id: "trace",
    route: [
      { route_type: "via", x: 2, y: -4, from_layer: "top", to_layer: "bottom" },
      {
        route_type: "via",
        x: 8,
        y: -1,
        from_layer: "top",
        to_layer: "bottom",
        tented_on_top: false,
        tented_on_bottom: true,
      },
      { route_type: "via", x: 8, y: -1, from_layer: "bottom", to_layer: "top" },
    ],
  },
]

// Probe where triangles actually land in the +Y-up scene, without deriving
// expectations from the converter's transforms or tessellation.
function surfaceCovers(mesh: STLMesh, x: number, z: number, side: number) {
  return mesh.triangles.some((triangle) => {
    if (triangle.normal.y * side < 0.9) return false
    const signs = triangle.vertices.map((a, i) => {
      const b = triangle.vertices[(i + 1) % 3]!
      return (b.x - a.x) * (z - a.z) - (b.z - a.z) * (x - a.x)
    })
    return (
      signs.every((sign) => sign >= -1e-8) ||
      signs.every((sign) => sign <= 1e-8)
    )
  })
}

test("standalone and route drills remain in the substrate with or without mask textures", async () => {
  const bare = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })
  const masked = await convertCircuitJsonTo3D(circuit, {
    textureResolution: 400,
  })
  expect(masked.boxes[0]!.mesh).toEqual(bare.boxes[0]!.mesh)
  expect(bare.boxes).toHaveLength(1)
  const substrate = masked.boxes[0]!.mesh!
  for (const side of [1, -1]) {
    expect(surfaceCovers(substrate, -2, -1, side)).toBe(false)
    expect(surfaceCovers(substrate, 4, 2, side)).toBe(false)
    expect(surfaceCovers(substrate, 0, 0, side)).toBe(true)
  }
  const film = masked.boxes.find((box) => box.label === "Via soldermask")!
  expect(film.textureAlphaMode).toBe("MASK")
  expect(surfaceCovers(film.mesh!, -2, -1, 1)).toBe(true)
  expect(surfaceCovers(film.mesh!, -2, -1, -1)).toBe(true)
  expect(surfaceCovers(film.mesh!, 4, 2, 1)).toBe(false)
  expect(surfaceCovers(film.mesh!, 4, 2, -1)).toBe(true)
  const vias = getPcbVias(circuit)
  expect(vias).toHaveLength(2)
  expect(vias[1]!.hole_diameter).toBe(1)
  expect(vias[1]!.outer_diameter).toBe(2)
})

test("via surface texture stays transparent at overlapping pad openings", async () => {
  const input: CircuitJson = [
    board,
    via,
    {
      type: "pcb_smtpad",
      pcb_smtpad_id: "pad",
      pcb_component_id: "component",
      shape: "rect",
      x: 2,
      y: -4,
      width: 2,
      height: 2,
      layer: "top",
    },
  ]
  const textures = await renderBoardTextures(input, {
    resolution: 400,
    viaTentingOnly: true,
  })
  const alphaAtVia = (texture: string) => {
    const image = new Resvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><image href="${texture}" width="400" height="240"/></svg>`,
    ).render()
    return image.pixels[(140 * 400 + 160) * 4 + 3]
  }
  expect(alphaAtVia(textures.top)).toBe(0)
  expect(alphaAtVia(textures.bottom)).toBe(255)
})

test("via defaults and deduplication use the owning board, with explicit dimensions preserved", () => {
  const vias = getPcbVias([
    { ...board, pcb_board_id: "a", subcircuit_id: "a" },
    {
      ...board,
      pcb_board_id: "b",
      subcircuit_id: "b",
      min_via_hole_diameter: 0.4,
      min_via_pad_diameter: 0.8,
      default_via_tented_on_top: false,
    },
    { ...via, subcircuit_id: "a" },
    {
      type: "pcb_trace",
      pcb_trace_id: "trace_b",
      subcircuit_id: "b",
      route: [
        {
          route_type: "via",
          x: 2,
          y: -4,
          from_layer: "top",
          to_layer: "bottom",
        },
        {
          route_type: "via",
          x: 8,
          y: -1,
          from_layer: "top",
          to_layer: "bottom",
          hole_diameter: 0.6,
          outer_diameter: 1.2,
          tented_on_top: true,
        },
      ],
    },
  ])
  expect(vias).toHaveLength(3)
  expect(vias[1]).toMatchObject({
    pcb_trace_id: "trace_b",
    subcircuit_id: "b",
    hole_diameter: 0.4,
    outer_diameter: 0.8,
    tented_on_top: false,
  })
  expect(vias[2]).toMatchObject({
    hole_diameter: 0.6,
    outer_diameter: 1.2,
    tented_on_top: true,
  })
})

test("a trace containing only a via point still receives an opaque tented surface", async () => {
  const scene = await convertCircuitJsonTo3D(
    [
      board,
      {
        type: "pcb_trace",
        pcb_trace_id: "via_only",
        route: [
          {
            route_type: "via",
            x: 2,
            y: -4,
            from_layer: "top",
            to_layer: "bottom",
          },
        ],
      },
    ],
    { textureResolution: 400 },
  )
  const film = scene.boxes.find((box) => box.label === "Via soldermask")!
  const image = new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><image href="${film.texture!.top}" width="400" height="240"/></svg>`,
  ).render()
  expect(image.pixels[(140 * 400 + 160) * 4 + 3]).toBe(255)
})
