import type { CircuitJson } from "circuit-json"
import type { RenderOptionsInput } from "poppygl"
import { KEYED_CAD_MODEL_URL } from "./keyed-cad-model"

export const fauxBoardPlacementCircuit: CircuitJson = [
  {
    type: "source_component",
    source_component_id: "source1",
    name: "U1",
    ftype: "simple_chip",
    supplier_part_numbers: {},
  },
  {
    type: "pcb_component",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    center: { x: 3, y: -7 },
    width: 6,
    height: 4,
    rotation: 0,
    layer: "top",
    obstructs_within_bounds: true,
  },
  {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    position: { x: 3, y: -7, z: 0.8 },
    rotation: { x: 0, y: 0, z: 0 },
    model_obj_url: KEYED_CAD_MODEL_URL,
    model_origin_position: { x: 0, y: 0, z: 0 },
    model_object_fit: "contain_within_bounds",
    anchor_alignment: "center",
  },
  {
    type: "pcb_silkscreen_path",
    pcb_silkscreen_path_id: "component-frame",
    pcb_component_id: "pcb1",
    layer: "top",
    stroke_width: 0.15,
    route: [
      { x: -0.4, y: -9.4 },
      { x: 6.4, y: -9.4 },
      { x: 6.4, y: -4.6 },
      { x: -0.4, y: -4.6 },
      { x: -0.4, y: -9.4 },
    ],
  },
]

// Fixed final-glTF (Y-up) camera includes both the correct and historical bad
// board locations. Never fit each image independently: that could hide drift.
export const fauxBoardPlacementCamera = {
  width: 900,
  height: 700,
  camPos: [-24, 18, 24],
  lookAt: [-3, -2, -3.5],
  up: "y+",
  fov: 35,
  ambient: 0.8,
  backgroundColor: "#f8fafc",
  grid: false,
} as const satisfies RenderOptionsInput
