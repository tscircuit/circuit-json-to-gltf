import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGlbToPng } from "../renderGlbToPng"

test("oval-hole-snapshot", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_0",
      center: { x: 0, y: 0 },
      thickness: 1.4,
      num_layers: 2,
      width: 30,
      height: 20,
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
      type: "pcb_hole",
      pcb_hole_id: "pcb_hole_0",
      x: 0,
      y: 0,
      hole_shape: "oval",
      hole_width: 5,
      hole_height: 2.5,
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
