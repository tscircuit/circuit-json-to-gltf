import type { CircuitJsonWithPcbFlex, PcbBendRecord } from "../lib"

export const DISC_RADIUS = 6
export const DISC_PITCH = 22
export const STACK_HEIGHT = 6
export const BEND_RADIUS = 1
const NECK_HALF_WIDTH = 1.25
const alpha = Math.asin(NECK_HALF_WIDTH / DISC_RADIUS)
const arc = (cx: number, from: number, to: number) => {
  const count = Math.ceil((to - from) / (Math.PI / 48))
  return Array.from({ length: count + 1 }, (_, i) => ({
    x: cx + DISC_RADIUS * Math.cos(from + ((to - from) * i) / count),
    y: DISC_RADIUS * Math.sin(from + ((to - from) * i) / count),
  }))
}

/** Three 12 mm discs joined by two 2.5 mm wide flex links. Flat: Circuit JSON
 * +Z up, mm. Four quarter-turn bends stack disc centers at (0,0,0/6/12).
 * Each pair folds 180 degrees; the second pair has opposite local signs.
 */
export function createThreeDiscFlex(): CircuitJsonWithPcbFlex {
  const width = (BEND_RADIUS * Math.PI) / 2
  const bendSpacing = STACK_HEIGHT + width - 2 * BEND_RADIUS
  const a = (DISC_PITCH - bendSpacing) / 2
  const b = (DISC_PITCH + bendSpacing) / 2
  const bends: PcbBendRecord[] = [a, b, DISC_PITCH + a, DISC_PITCH + b].map(
    (x, i) => ({
      type: "pcb_bend",
      pcb_bend_id: `pcb_bend_${i + 1}`,
      pcb_board_id: "pcb_board_1",
      // Board center is midway along the flat strip.
      start: { x: x - DISC_PITCH, y: -NECK_HALF_WIDTH },
      end: { x: x - DISC_PITCH, y: NECK_HALF_WIDTH },
      bend_angle: i < 2 ? 90 : -90,
      bend_radius: BEND_RADIUS,
      bend_side: "right",
    }),
  )
  return [
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_1",
      center: { x: DISC_PITCH, y: 0 },
      width: 2 * DISC_PITCH + 2 * DISC_RADIUS,
      height: 2 * DISC_RADIUS,
      thickness: 0.15,
      num_layers: 2,
      // material="flex" is not yet in the released circuit-json board schema.
      material: "flex",
      solder_mask_color: "#cc9b32",
      outline: [
        ...arc(0, alpha, 2 * Math.PI - alpha),
        ...arc(DISC_PITCH, Math.PI + alpha, 2 * Math.PI - alpha),
        ...arc(2 * DISC_PITCH, Math.PI + alpha, 3 * Math.PI - alpha),
        ...arc(DISC_PITCH, alpha, Math.PI - alpha),
      ],
    },
    ...bends,
    ...[-0.55, 0, 0.55].map((y, i) => ({
      type: "pcb_trace",
      pcb_trace_id: `trace_${i}`,
      route: [
        { route_type: "wire", x: -3, y, width: 0.18, layer: "top" },
        {
          route_type: "wire",
          x: 2 * DISC_PITCH + 3,
          y,
          width: 0.18,
          layer: "top",
        },
      ],
    })),
    ...[0, 1, 2].map((i) => ({
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: `disc_label_${i}`,
      anchor_position: { x: i * DISC_PITCH, y: -3 },
      text: `${i + 1}`,
      font_size: 1.4,
      layer: "top",
      anchor_alignment: "center",
      ccw_rotation: 0,
    })),
    ...[0, 1, 2].flatMap((i) => [
      {
        type: "source_component",
        source_component_id: `source_${i}`,
        ftype: "simple_chip",
        name: `U${i + 1}`,
      },
      {
        type: "pcb_component",
        pcb_component_id: `pcb_component_${i}`,
        source_component_id: `source_${i}`,
        center: { x: i * DISC_PITCH + 1, y: 1 },
        width: 2,
        height: 1.5,
        rotation: 0,
        layer: "top",
        obstructs_within_bounds: true,
      },
      {
        type: "cad_component",
        cad_component_id: `cad_${i}`,
        source_component_id: `source_${i}`,
        pcb_component_id: `pcb_component_${i}`,
        position: { x: i * DISC_PITCH + 1, y: 1, z: 0.575 },
        size: { x: 2, y: 1.5, z: 1 },
        model_jscad: { type: "cuboid", size: [2, 1.5, 1] },
        show_as_bounding_box: true,
        model_object_fit: "contain_within_bounds",
        anchor_alignment: "center",
      },
      // Board-relative polygon backing follows each disc as a rigid object.
      {
        type: "pcb_stiffener",
        pcb_stiffener_id: `pcb_stiffener_${i}`,
        pcb_board_id: "pcb_board_1",
        shape: "polygon",
        outline: Array.from({ length: 48 }, (_, j) => ({
          x: (i - 1) * DISC_PITCH + 5.5 * Math.cos((j * Math.PI) / 24),
          y: 5.5 * Math.sin((j * Math.PI) / 24),
        })),
        layer: "bottom",
        material: "fr4",
        thickness: 0.2,
        adhesive_thickness: 0.05,
      },
    ]),
  ] as CircuitJsonWithPcbFlex
}
