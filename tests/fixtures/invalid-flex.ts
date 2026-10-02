import type { CircuitJsonWithPcbFlex } from "../../lib/types"

import { addCadMarker } from "./two-arm-flex"

/** Crossing finite bend regions partially overlap on a rectangular board.
 * Both bends cut full board cross-sections; neither moving region contains the
 * other. Circuit JSON and bend-local coordinates are +Z up in millimeters.
 */
export function createCrossingFlex(): CircuitJsonWithPcbFlex {
  const circuitJson: CircuitJsonWithPcbFlex = [
    {
      type: "pcb_board",
      pcb_board_id: "flex_board",
      center: { x: 0, y: 0 },
      width: 40,
      height: 40,
      thickness: 0.12,
      num_layers: 2,
      material: "flex",
      solder_mask_color: "#cc9b32",
      outline: [
        { x: -20, y: -20 },
        { x: 20, y: -20 },
        { x: 20, y: 20 },
        { x: -20, y: 20 },
      ],
    },
    {
      type: "pcb_bend",
      pcb_bend_id: "upper_half",
      pcb_board_id: "flex_board",
      start: { x: -20, y: 0 },
      end: { x: 20, y: 0 },
      bend_angle: 90,
      bend_radius: 1,
      bend_side: "left",
    },
    {
      type: "pcb_bend",
      pcb_bend_id: "right_half",
      pcb_board_id: "flex_board",
      start: { x: 0, y: -20 },
      end: { x: 0, y: 20 },
      bend_angle: 90,
      bend_radius: 1,
      bend_side: "right",
    },
  ]
  addCadMarker(circuitJson, "R1", { x: -10, y: 10 })
  addCadMarker(circuitJson, "R2", { x: 10, y: -10 })
  return circuitJson
}

export function createBendZoneFlex(addCad = false): CircuitJsonWithPcbFlex {
  const circuitJson: CircuitJsonWithPcbFlex = [
    {
      type: "pcb_board",
      pcb_board_id: "flex_board",
      center: { x: 0, y: 0 },
      width: 40,
      height: 20,
      thickness: 0.12,
      num_layers: 2,
      material: "flex",
      solder_mask_color: "#cc9b32",
    },
    {
      type: "pcb_bend",
      pcb_bend_id: "bend_zone",
      pcb_board_id: "flex_board",
      start: { x: 0, y: -10 },
      end: { x: 0, y: 10 },
      bend_angle: 90,
      bend_radius: 1,
      bend_side: "left",
    },
    {
      type: "pcb_via",
      pcb_via_id: "via_in_zone",
      x: 0,
      y: 4,
      hole_diameter: 0.2,
      outer_diameter: 0.5,
      layers: ["top", "bottom"],
    },
    {
      type: "pcb_trace",
      pcb_trace_id: "corner_in_zone",
      route: [
        { route_type: "wire", x: -5, y: 0, width: 0.1, layer: "top" },
        { route_type: "wire", x: 0, y: 0, width: 0.1, layer: "top" },
        { route_type: "wire", x: 0, y: 3, width: 0.1, layer: "top" },
      ],
    },
    {
      type: "pcb_stiffener",
      pcb_stiffener_id: "stiffener_in_zone",
      pcb_board_id: "flex_board",
      shape: "rect",
      center: { x: 0, y: -7 },
      width: 2,
      height: 2,
      layer: "bottom",
      material: "polyimide",
      thickness: 0.2,
    },
  ]
  if (addCad) {
    addCadMarker(circuitJson, "R1", { x: 0, y: -4 })
    addCadMarker(circuitJson, "R3", { x: -8, y: 0 })
  }
  return circuitJson
}
