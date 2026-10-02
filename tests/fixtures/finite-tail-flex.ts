import type { CircuitJsonWithPcbFlex } from "../../lib/types"

/** Exact U-shaped board and left-tail bend from tscircuit/tscircuit#5277.
 * Circuit JSON is right-handed: +X right, +Y top, +Z above, in millimeters.
 * Outline, PCB/CAD centers, and labels are world-space points translated by
 * boardCenter. Bend endpoints are board-local points; no directions are
 * translated. CAD markers are model-local centered cuboids in that same frame.
 */
export function createFiniteTailFlex(
  boardCenter: { x: number; y: number } = { x: 0, y: 0 },
): CircuitJsonWithPcbFlex {
  const point = (x: number, y: number) => ({
    x: x + boardCenter.x,
    y: y + boardCenter.y,
  })
  const circuitJson: CircuitJsonWithPcbFlex = [
    {
      type: "pcb_board",
      pcb_board_id: "flex_board",
      center: { ...boardCenter },
      width: 40,
      height: 40,
      thickness: 0.12,
      num_layers: 2,
      material: "flex",
      solder_mask_color: "#cc9b32",
      outline: [
        point(-20, -10),
        point(20, -10),
        point(20, 30),
        point(12, 30),
        point(12, 10),
        point(-12, 10),
        point(-12, 30),
        point(-20, 30),
      ],
    },
    {
      type: "pcb_bend",
      pcb_bend_id: "left_tail_bend",
      pcb_board_id: "flex_board",
      start: { x: -20, y: 20 },
      end: { x: -12, y: 20 },
      bend_angle: 90,
      bend_radius: 1,
      bend_side: "left",
    },
  ]

  for (const [name, x] of [
    ["RL", -16],
    ["RR", 16],
  ] as const) {
    const sourceComponentId = `source_${name}`
    const pcbComponentId = `pcb_${name}`
    circuitJson.push(
      {
        type: "source_component",
        source_component_id: sourceComponentId,
        ftype: "simple_chip",
        name,
      },
      {
        type: "pcb_component",
        pcb_component_id: pcbComponentId,
        source_component_id: sourceComponentId,
        center: point(x, 25),
        width: 2,
        height: 1,
        rotation: 0,
        layer: "top",
        obstructs_within_bounds: true,
      },
      {
        type: "cad_component",
        cad_component_id: `cad_${name}`,
        source_component_id: sourceComponentId,
        pcb_component_id: pcbComponentId,
        position: { ...point(x, 25), z: 0.33 },
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
        pcb_component_id: pcbComponentId,
        anchor_position: point(x, 27.5),
        text: name,
        font_size: 1.6,
        font: "tscircuit2024",
        layer: "top",
        anchor_alignment: "center",
        ccw_rotation: 0,
      },
    )
  }

  return circuitJson
}
