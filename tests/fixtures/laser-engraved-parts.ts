import type { CircuitJson } from "circuit-json"
import type { ManufacturingLaserEngravingTextRecord } from "../../lib"

/** Two printed parts with laser-engraved text, in right-handed circuit world
 * (+X right, +Y top, +Z up, mm).
 *
 * LID is a dark 60 x 40 x 8 block centered on the origin, resting on Z=0, so
 * its top is Z=8, its -Y wall is Y=-20 and its +X wall is X=30. PLATE is a
 * pale 36 x 36 x 4 block centered at X=58.
 *
 * Engraving records are not in a released circuit-json yet, so the document is
 * cast to CircuitJson.
 */
const part = (
  index: number,
  name: string,
  color: string,
  size: [number, number, number],
  center: [number, number],
) => [
  {
    type: "source_component",
    source_component_id: `source_component_${index}`,
    ftype: "printedpart",
    name,
    color,
  },
  {
    type: "cad_component",
    cad_component_id: `cad_component_${index}`,
    source_component_id: `source_component_${index}`,
    position: { x: 0, y: 0, z: 0 },
    rotation: { x: 0, y: 0, z: 0 },
    color,
    model_jscad: {
      type: "cuboid",
      size,
      center: [center[0], center[1], size[2] / 2],
    },
  },
]

const engraving = (
  index: number,
  owner: number,
  fields: Pick<
    ManufacturingLaserEngravingTextRecord,
    "text" | "font_size" | "anchor_position" | "normal" | "x_axis"
  > &
    Partial<ManufacturingLaserEngravingTextRecord>,
): ManufacturingLaserEngravingTextRecord => ({
  type: "manufacturing_laser_engraving_text",
  manufacturing_laser_engraving_text_id: `manufacturing_laser_engraving_text_${index}`,
  source_component_id: `source_component_${owner}`,
  cad_component_id: `cad_component_${owner}`,
  font: "tscircuit2024",
  anchor_alignment: "center",
  ...fields,
})

const up = { x: 0, y: 0, z: 1 }
const right = { x: 1, y: 0, z: 0 }

export const laserEngravings: ManufacturingLaserEngravingTextRecord[] = [
  // LID top, centered.
  engraving(0, 0, {
    text: "tscircuit",
    font_size: 6,
    anchor_position: { x: 0, y: 1, z: 8 },
    normal: up,
    x_axis: right,
  }),
  // LID top, hung from its top-left corner 3 mm in from two edges.
  engraving(1, 0, {
    text: "REV B",
    font_size: 3,
    anchor_position: { x: -27, y: 17, z: 8 },
    anchor_alignment: "top_left",
    normal: up,
    x_axis: right,
  }),
  // LID top, turned 90 degrees clockwise seen from above: reads toward -Y.
  engraving(2, 0, {
    text: "LOT 42",
    font_size: 2.5,
    anchor_position: { x: 26, y: 0, z: 8 },
    normal: up,
    x_axis: { x: 0, y: -1, z: 0 },
  }),
  // LID wall facing -Y, with a stated resulting color.
  engraving(3, 0, {
    text: "SN 0001",
    font_size: 4,
    anchor_position: { x: 0, y: -20, z: 4 },
    normal: { x: 0, y: -1, z: 0 },
    x_axis: right,
    resulting_color: "#e8c15a",
  }),
  // LID wall facing +X, reading toward +Y.
  engraving(4, 0, {
    text: "FCC",
    font_size: 4,
    anchor_position: { x: 30, y: 0, z: 4 },
    normal: right,
    x_axis: { x: 0, y: 1, z: 0 },
  }),
  // PLATE top: a pale part, so the derived mark is dark.
  engraving(5, 1, {
    text: "MODEL A1",
    font_size: 3.5,
    anchor_position: { x: 58, y: 0, z: 4 },
    normal: up,
    x_axis: right,
  }),
]

export const laserEngravedParts = [
  ...part(0, "LID", "#2f3b4a", [60, 40, 8], [0, 0]),
  ...part(1, "PLATE", "#d8d2c4", [36, 36, 4], [58, 0]),
  ...laserEngravings,
] as unknown as CircuitJson
