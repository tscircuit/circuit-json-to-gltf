import { createBoardOwnerMap } from "@tscircuit/circuit-json-util"
import type { AnyCircuitElement, PcbVia, PcbViaInput } from "circuit-json"

export function getPcbVias(circuitJson: AnyCircuitElement[]): PcbVia[] {
  const boardOwnerMap = createBoardOwnerMap(circuitJson)
  const vias = circuitJson.filter((element) => element.type === "pcb_via")
  const viasByPosition = new Map<string, PcbVia[]>()

  for (const via of vias) {
    const board = boardOwnerMap.get(via.pcb_via_id)
    const positionKey = `${board?.pcb_board_id ?? ""}:${via.x}:${via.y}`
    const viasAtPosition = viasByPosition.get(positionKey) ?? []
    viasAtPosition.push(via)
    viasByPosition.set(positionKey, viasAtPosition)
  }

  for (const trace of circuitJson.filter(
    (element) => element.type === "pcb_trace",
  )) {
    const board = boardOwnerMap.get(trace.pcb_trace_id)
    for (const [index, point] of trace.route.entries()) {
      if (point.route_type !== "via") continue
      const positionKey = `${board?.pcb_board_id ?? ""}:${point.x}:${point.y}`
      const viasAtPosition = viasByPosition.get(positionKey) ?? []
      const hasMatchingVia = viasAtPosition.some(
        (via) =>
          via.layers.includes(point.from_layer) &&
          via.layers.includes(point.to_layer),
      )
      if (hasMatchingVia) continue

      const via: PcbVia = {
        type: "pcb_via",
        pcb_via_id: `${trace.pcb_trace_id}_route_via_${index}`,
        pcb_trace_id: trace.pcb_trace_id,
        subcircuit_id: trace.subcircuit_id,
        pcb_group_id: trace.pcb_group_id,
        x: point.x,
        y: point.y,
        layers: [point.from_layer, point.to_layer],
        hole_diameter:
          point.hole_diameter ?? board?.min_via_hole_diameter ?? 0.25,
        outer_diameter:
          point.outer_diameter ?? board?.min_via_pad_diameter ?? 0.6,
        tented_on_top: point.tented_on_top,
        tented_on_bottom: point.tented_on_bottom,
      }
      vias.push(via)
      viasAtPosition.push(via)
      viasByPosition.set(positionKey, viasAtPosition)
    }
  }
  return vias.map((via) => {
    const board =
      boardOwnerMap.get(via.pcb_via_id) ??
      (via.pcb_trace_id ? boardOwnerMap.get(via.pcb_trace_id) : undefined)
    const tenting: PcbViaInput = via
    return {
      ...via,
      tented_on_top:
        via.tented_on_top ??
        tenting.is_tented ??
        board?.default_via_tented_on_top ??
        false,
      tented_on_bottom:
        via.tented_on_bottom ??
        tenting.is_tented ??
        board?.default_via_tented_on_bottom ??
        false,
    }
  })
}
