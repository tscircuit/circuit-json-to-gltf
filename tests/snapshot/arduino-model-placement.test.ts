import { test, expect } from "bun:test"
import { renderGlbToPng } from "../renderGlbToPng"
import { convertCircuitJsonToGltf } from "../../lib/index"
import type { CircuitJson } from "circuit-json"

test("cad model placment", async () => {
  const circuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_0",
      center: { x: 0, y: 0 },
      width: 50,
      height: 30,
      thickness: 1.4,
    },
    {
      type: "source_component",
      source_component_id: "source_component_0",
      name: "U1",
      display_value: "C9900017879",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_component_0",
      source_component_id: "source_component_0",
      center: { x: 0, y: 0 },
      width: 6,
      height: 5,
      layer: "top",
    },
    {
      type: "cad_component",
      cad_component_id: "cad_component_0",
      position: {
        x: 0,
        y: 1.0658141036401503e-14,
        z: 0.7,
      },
      rotation: {
        x: 0,
        y: 0,
        z: 270,
      },
      pcb_component_id: "pcb_component_0",
      source_component_id: "source_component_0",
      model_stl_url: null,
      model_obj_url:
        "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=4e90b6d8552a4e058d9ebe9d82e11f3a&pn=C9900017879&cachebust_origin=",
      model_mtl_url: null,
      model_gltf_url: null,
      model_glb_url: null,
      model_step_url: null,
      model_wrl_url: null,
      model_jscad: null,
      model_unit_to_mm_scale_factor: null,
      model_board_normal_direction: null,
      model_origin_alignment: "center_of_component_on_board_surface",
      anchor_alignment: "center_of_component_on_board_surface",
      model_origin_position: {
        x: 0,
        y: 0,
        z: -2.5,
      },
      footprinter_string: null,
      show_as_translucent_model: null,
    },
  ] as CircuitJson

  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 1024,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  expect(
    renderGlbToPng(glbResult as ArrayBuffer, circuitJson),
  ).toMatchPngSnapshot(import.meta.path)
})
