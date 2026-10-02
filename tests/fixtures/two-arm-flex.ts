import type { CircuitJsonWithPcbFlex } from "../../lib/types"

/** Two perpendicular arms from tscircuit#5277. Circuit JSON outline, CAD and
 * PCB positions are world points (+Z up, mm); bend endpoints remain board-local.
 * The right bend selects its outward arm with "right". "left" reproduces the
 * screenshot's nested arrangement, carrying the main body and upper arm.
 */
export function createTwoArmFlex({
  boardCenter = { x: 0, y: 0 },
  rightArmBendSide = "right",
}: {
  boardCenter?: { x: number; y: number }
  rightArmBendSide?: "left" | "right"
} = {}): CircuitJsonWithPcbFlex {
  const point = (x: number, y: number) => ({
    x: x + boardCenter.x,
    y: y + boardCenter.y,
  })
  const circuitJson: CircuitJsonWithPcbFlex = [
    {
      type: "pcb_board",
      pcb_board_id: "flex_board",
      center: { ...boardCenter },
      width: 60,
      height: 40,
      thickness: 0.12,
      num_layers: 2,
      material: "flex",
      outline: [
        point(-20, -10),
        point(20, -10),
        point(20, -4),
        point(40, -4),
        point(40, 4),
        point(20, 4),
        point(20, 10),
        point(4, 10),
        point(4, 30),
        point(-4, 30),
        point(-4, 10),
        point(-20, 10),
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
      bend_side: rightArmBendSide,
    },
  ]
  addCadMarker(circuitJson, "R1", point(0, 25))
  addCadMarker(circuitJson, "R2", point(35, 0))
  // Legacy flex CAD may omit rotation. The shared flat-layer default applies.
  for (const element of circuitJson)
    if (element.type === "cad_component") element.rotation = undefined
  return circuitJson
}

/** Centered model-local cuboids and world-space labels. The mount is a Circuit
 * JSON world XY point; CAD height is +Z up in millimeters.
 */
export function addCadMarker(
  circuitJson: CircuitJsonWithPcbFlex,
  name: string,
  mount: { x: number; y: number },
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
      center: { ...mount },
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
      position: { ...mount, z: 0.33 },
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
      anchor_position: { x: mount.x, y: mount.y + 2.5 },
      text: name,
      font_size: 1.6,
      font: "tscircuit2024",
      layer: "top",
      anchor_alignment: "center",
      ccw_rotation: 0,
    },
  )
}
