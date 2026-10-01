import type { CircuitJsonWithPcbFlex } from "../../lib/types"

/** Exact unsupported-board and bend-zone fixtures from tscircuit#5277.
 * Circuit JSON points use right-handed world XY, +Z above, millimeters.
 * Bends and stiffeners use board-local points. The board center is the origin.
 */
export function createNonparallelFlex(): CircuitJsonWithPcbFlex {
  const circuitJson: CircuitJsonWithPcbFlex = [
    {
      type: "pcb_board",
      pcb_board_id: "flex_board",
      center: { x: 0, y: 0 },
      width: 60,
      height: 40,
      thickness: 0.12,
      num_layers: 2,
      material: "flex",
      solder_mask_color: "#cc9b32",
      outline: [
        { x: -20, y: -10 },
        { x: 20, y: -10 },
        { x: 20, y: -4 },
        { x: 40, y: -4 },
        { x: 40, y: 4 },
        { x: 20, y: 4 },
        { x: 20, y: 10 },
        { x: 4, y: 10 },
        { x: 4, y: 30 },
        { x: -4, y: 30 },
        { x: -4, y: 10 },
        { x: -20, y: 10 },
      ],
    },
    {
      type: "pcb_bend",
      pcb_bend_id: "upward_tail",
      pcb_board_id: "flex_board",
      start: { x: -4, y: 20 },
      end: { x: 4, y: 20 },
      bend_angle: 90,
      bend_radius: 1,
      bend_side: "left",
    },
    {
      type: "pcb_bend",
      pcb_bend_id: "sideways_tail",
      pcb_board_id: "flex_board",
      start: { x: 30, y: -4 },
      end: { x: 30, y: 4 },
      bend_angle: 90,
      bend_radius: 1,
      bend_side: "left",
    },
  ]
  addCadMarker(circuitJson, "R1", 0, 25)
  addCadMarker(circuitJson, "R2", 35, 0)
  // Legacy flex CAD can omit rotation; resolving it must not rebuild the bad fold.
  for (const element of circuitJson)
    if (element.type === "cad_component") element.rotation = undefined
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
    addCadMarker(circuitJson, "R1", 0, -4)
    addCadMarker(circuitJson, "R3", -8, 0)
  }
  return circuitJson
}

/** Centered rigid CAD cuboids and world-space silkscreen labels. CAD positions
 * are Circuit JSON points (+Z above, mm); rotation is intrinsic XYZ degrees.
 */
function addCadMarker(
  circuitJson: CircuitJsonWithPcbFlex,
  name: string,
  x: number,
  y: number,
) {
  circuitJson.push(
    {
      type: "source_component",
      source_component_id: `source_${name}`,
      ftype: "simple_chip",
      name,
    },
    {
      type: "pcb_component",
      pcb_component_id: `pcb_${name}`,
      source_component_id: `source_${name}`,
      center: { x, y },
      width: 2,
      height: 1,
      rotation: 0,
      layer: "top",
      obstructs_within_bounds: true,
    },
    {
      type: "cad_component",
      cad_component_id: `cad_${name}`,
      source_component_id: `source_${name}`,
      pcb_component_id: `pcb_${name}`,
      position: { x, y, z: 0.33 },
      rotation: { x: 0, y: 0, z: 0 },
      size: { x: 2, y: 1, z: 0.54 },
      model_jscad: { type: "cuboid", size: [2, 1, 0.54] },
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
      layer: "top",
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: `label_${name}`,
      pcb_component_id: `pcb_${name}`,
      anchor_position: { x, y: y + 2.5 },
      text: name,
      font_size: 1.6,
      font: "tscircuit2024",
      layer: "top",
      anchor_alignment: "center",
      ccw_rotation: 0,
    },
  )
}
