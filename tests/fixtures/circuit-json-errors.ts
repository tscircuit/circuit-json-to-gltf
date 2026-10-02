import type { CircuitJsonWithPcbFlex } from "../../lib/types"

export function createCircuitJsonErrors(): CircuitJsonWithPcbFlex {
  return [
    {
      type: "pcb_board",
      pcb_board_id: "translated_board",
      center: { x: 100, y: -70 },
      width: 40,
      height: 20,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    {
      type: "pcb_trace",
      pcb_trace_id: "trace_near_R1",
      route: [
        { route_type: "wire", x: 91, y: -73, width: 0.6, layer: "top" },
        { route_type: "wire", x: 110, y: -73, width: 0.6, layer: "top" },
      ],
    },
    {
      type: "pcb_trace_error",
      pcb_trace_error_id: "clearance_error",
      error_type: "pcb_trace_error",
      message:
        "Trace near R1 violates clearance: minimum 0.2 mm; measured 0.08 mm.",
      center: { x: 101, y: -73 },
      pcb_trace_id: "trace_near_R1",
      source_trace_id: "source_trace_near_R1",
      pcb_component_ids: [],
      pcb_port_ids: [],
    },
    {
      type: "source_missing_property_error",
      source_missing_property_error_id: "missing_part_number",
      error_type: "source_missing_property_error",
      source_component_id: "source_U1",
      property_name: "manufacturerPartNumber",
      message:
        "U1 is missing manufacturerPartNumber. Choose a supplier part before ordering this board; this source error has no PCB coordinates and must remain visible in the 3D render.",
    },
  ]
}
