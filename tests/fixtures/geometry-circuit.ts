import type { CadComponent, CircuitJson, PcbBoard } from "circuit-json"

export const geometryBoard: PcbBoard = {
  type: "pcb_board",
  pcb_board_id: "board",
  subcircuit_id: "board-sub",
  center: { x: 0, y: 0 },
  width: 20,
  height: 16,
  thickness: 1.6,
  num_layers: 2,
  material: "fr4",
}

export const asymmetricObj =
  "v 1 2 3 1 0 0\nv 5 2 3 0 1 0\nv 1 8 3 0 0 1\nv 1 2 7 1 0 0\nf 1 3 2\nf 1 2 4\nf 2 3 4\nf 3 1 4\n"

export function geometryCircuit(cad: Partial<CadComponent> = {}): CircuitJson {
  return [
    { ...geometryBoard, center: { ...geometryBoard.center } },
    {
      type: "pcb_component",
      pcb_component_id: "pcb",
      source_component_id: "source",
      subcircuit_id: "board-sub",
      center: { x: 3, y: 4 },
      width: 5,
      height: 6,
      layer: "top",
      rotation: 0,
      obstructs_within_bounds: true,
    },
    {
      type: "cad_component",
      cad_component_id: "cad",
      pcb_component_id: "pcb",
      source_component_id: "source",
      position: { x: 3, y: 4, z: 0.8 },
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
      model_obj_url: `data:text/plain,${encodeURIComponent(asymmetricObj)}`,
      ...cad,
    },
  ]
}
