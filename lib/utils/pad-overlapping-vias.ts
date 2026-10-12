import type { CircuitJson, PcbVia, PcbHole } from "circuit-json"
import {
  circle,
  ellipse,
  polygon,
  roundedRectangle,
} from "@jscad/modeling/src/primitives"
import { rotateZ, translate } from "@jscad/modeling/src/operations/transforms"
import { intersect } from "@jscad/modeling/src/operations/booleans"
import {
  measureArea,
  measureBoundingBox,
} from "@jscad/modeling/src/measurements"
import type { STLMesh } from "../types"

/** Flat pad/via footprints are Circuit JSON world XY points in mm (+Z up).
 * Reuse JSCAD's 2D shapes so rotated, rounded and polygon pads keep their outline. */
export function getPadOverlappingVias(circuit: CircuitJson): PcbVia[] {
  const vias = circuit.filter((e): e is PcbVia => e.type === "pcb_via").slice()
  for (const trace of circuit) {
    if (trace.type !== "pcb_trace") continue
    const board = circuit.find((e) => e.type === "pcb_board")
    for (const [index, point] of trace.route.entries()) {
      if (
        point.route_type !== "via" ||
        vias.some(
          (v) =>
            v.x === point.x &&
            v.y === point.y &&
            v.layers.includes(point.from_layer) &&
            v.layers.includes(point.to_layer),
        )
      )
        continue
      vias.push({
        type: "pcb_via",
        pcb_via_id: `${trace.pcb_trace_id}_via_${index}`,
        x: point.x,
        y: point.y,
        layers: [point.from_layer, point.to_layer],
        hole_diameter:
          point.hole_diameter ??
          (board?.type === "pcb_board"
            ? board.min_via_hole_diameter
            : undefined) ??
          0.25,
        outer_diameter:
          point.outer_diameter ??
          (board?.type === "pcb_board"
            ? board.min_via_pad_diameter
            : undefined) ??
          0.6,
      })
    }
  }
  if (!vias.length) return []
  const pads = circuit.flatMap((pad) => {
    if (
      (pad.type !== "pcb_smtpad" && pad.type !== "pcb_plated_hole") ||
      pad.is_covered_with_solder_mask
    )
      return []
    const p = pad as any
    let footprint
    let local = true
    const points = p.points ?? p.pad_outline
    if (points?.length >= 3) {
      footprint = polygon({
        points: points.map((point: any) => [point.x, point.y]),
      })
      local = pad.type === "pcb_plated_hole"
    } else if (pad.shape === "circle") {
      footprint = circle({
        radius: p.radius ?? p.outer_diameter / 2,
        segments: 64,
      })
    } else {
      const width = p.rect_pad_width ?? p.width ?? p.outer_width
      const height = p.rect_pad_height ?? p.height ?? p.outer_height
      if (!(width > 0 && height > 0)) return []
      footprint =
        pad.shape === "oval"
          ? ellipse({ radius: [width / 2, height / 2], segments: 64 })
          : roundedRectangle({
              size: [width, height],
              roundRadius: Math.min(
                p.corner_radius ??
                  p.rect_border_radius ??
                  (pad.shape.includes("pill") && !p.rect_pad_width
                    ? Math.min(width, height) / 2
                    : 0),
                Math.max(0, Math.min(width, height) / 2 - 1e-4),
              ),
              segments: 64,
            })
      const rotation = p.rect_ccw_rotation ?? p.ccw_rotation ?? 0
      if (rotation) footprint = rotateZ((rotation * Math.PI) / 180, footprint)
    }
    if (local) footprint = translate([p.x, p.y, 0], footprint)
    return [
      {
        footprint,
        bounds: measureBoundingBox(footprint),
        layers: pad.type === "pcb_smtpad" ? [pad.layer] : pad.layers,
      },
    ]
  })
  return vias.filter(
    (via) =>
      via.hole_diameter > 0 &&
      pads.some(({ footprint, bounds, layers }) => {
        if (layers && !via.layers.some((layer) => layers.includes(layer)))
          return false
        const radius = via.outer_diameter / 2
        if (
          via.x + radius < bounds[0][0] ||
          via.x - radius > bounds[1][0] ||
          via.y + radius < bounds[0][1] ||
          via.y - radius > bounds[1][1]
        )
          return false
        return (
          measureArea(
            intersect(
              footprint,
              circle({ center: [via.x, via.y], radius, segments: 64 }),
            ),
          ) > 1e-10
        )
      }),
  )
}

export function viaDrills(vias: PcbVia[]): PcbHole[] {
  return vias.map((via) => ({
    type: "pcb_hole",
    pcb_hole_id: via.pcb_via_id,
    hole_shape: "circle",
    x: via.x,
    y: via.y,
    hole_diameter: via.hole_diameter,
  }))
}

/** Mesh points use board-local Scene3D coordinates (+Y up, mm), matching
 * createHoleLoops + triangles-from-loops: local X = via.x-center.x,
 * local Z = via.y-center.y. Extract plating before any flex deformation. */
export function splitViaWalls(
  mesh: STLMesh,
  center: { x: number; y: number },
  vias: PcbVia[],
) {
  if (!vias.length) return { board: mesh, copper: { ...mesh, triangles: [] } }
  const copper: STLMesh = { ...mesh, triangles: [] }
  const board: STLMesh = { ...mesh, triangles: [] }
  for (const triangle of mesh.triangles) {
    const isViaWall =
      Math.abs(triangle.normal.y) < 1e-6 &&
      vias.some((via) => {
        const x = via.x - center.x,
          z = via.y - center.y,
          radius = via.hole_diameter / 2
        return triangle.vertices.every(
          (p) =>
            Math.abs(Math.hypot(p.x - x, p.z - z) - radius) <
            radius * 0.08 + 1e-5,
        )
      })
    ;(isViaWall ? copper : board).triangles.push(triangle)
  }
  return { board, copper }
}
