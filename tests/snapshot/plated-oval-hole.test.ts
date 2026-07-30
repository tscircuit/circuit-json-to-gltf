import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGlbToPng } from "../renderGlbToPng"

test("plated-oval-hole-snapshot", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_0",
      center: { x: 0, y: 0 },
      thickness: 1.4,
      num_layers: 2,
      width: 10,
      height: 10,
      material: "fr4",
      min_trace_width: 0.1,
      min_via_hole_diameter: 0.2,
      min_via_pad_diameter: 0.3,
      min_via_hole_edge_to_via_hole_edge_clearance: 0.1,
      min_trace_to_pad_edge_clearance: 0.1,
      min_pad_edge_to_pad_edge_clearance: 0.1,
      min_plated_hole_drill_edge_to_drill_edge_clearance: 0.15,
      min_board_edge_clearance: 0.2,
    },
    {
      type: "pcb_plated_hole",
      pcb_plated_hole_id: "pcb_plated_hole_1",
      pcb_component_id: "pcb_component_0",
      pcb_port_id: "pcb_port_1",
      shape: "oval",
      x: 0,
      y: 0,
      hole_width: 2.2,
      hole_height: 1,
      outer_width: 4.2,
      outer_height: 2.2,
      port_hints: ["PH_OVAL", "2"],
      layers: ["top", "bottom"],
      is_covered_with_solder_mask: false,
      subcircuit_id: "subcircuit_source_group_0",
      ccw_rotation: 0,
    },
  ]

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)
  expect(renderGlbToPng(glb as ArrayBuffer, circuitJson)).toMatchPngSnapshot(
    import.meta.path,
  )
})
