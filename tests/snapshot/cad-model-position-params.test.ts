import { test, expect } from "bun:test"
import { mkdir } from "node:fs/promises"
import { dirname, join } from "node:path"
import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"

const REMOTE_MODEL_URL =
  "https://modelcdn.tscircuit.com/easyeda_models/download?uuid=4e90b6d8552a4e058d9ebe9d82e11f3a&pn=C9900017879&cachebust_origin="

test("cad-model-position-params-with-silkscreen", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 0, y: 0 },
      width: 210,
      height: 108,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },

    {
      type: "pcb_component",
      pcb_component_id: "pcb-legacy",
      source_component_id: "source-legacy",
      center: { x: -72, y: 8 },
      width: 6,
      height: 4,
      layer: "top",
      rotation: 0,
      obstructs_within_bounds: false,
    },
    {
      type: "cad_component",
      cad_component_id: "cad-legacy",
      pcb_component_id: "pcb-legacy",
      source_component_id: "source-legacy",
      model_obj_url: REMOTE_MODEL_URL,
      size: { x: 24, y: 40, z: 18 },
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
      show_as_translucent_model: true,
      position: { x: -72, y: 8.9, z: 6.1 },
    },
    {
      type: "pcb_silkscreen_path",
      pcb_silkscreen_path_id: "cad-legacy-frame",
      pcb_component_id: "board1",
      layer: "top",
      route: [
        { x: -93, y: -18 },
        { x: -51, y: -18 },
        { x: -51, y: 34 },
        { x: -93, y: 34 },
        { x: -93, y: -18 },
      ],
      stroke_width: 0.35,
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "cad-legacy-label",
      pcb_component_id: "board1",
      anchor_alignment: "center",
      anchor_position: { x: -72, y: -28 },
      font: "tscircuit2024",
      font_size: 3.5,
      layer: "top",
      text: "anchor_alignment\ncenter",
      ccw_rotation: 0,
    },

    {
      type: "pcb_component",
      pcb_component_id: "pcb-board-normal-z",
      source_component_id: "source-board-normal-z",
      center: { x: -24, y: 8 },
      width: 6,
      height: 4,
      layer: "top",
      rotation: 0,
      obstructs_within_bounds: false,
    },
    {
      type: "cad_component",
      cad_component_id: "cad-board-normal-z",
      pcb_component_id: "pcb-board-normal-z",
      source_component_id: "source-board-normal-z",
      model_obj_url: REMOTE_MODEL_URL,
      size: { x: 24, y: 40, z: 18 },
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
      model_board_normal_direction: "z+",
      model_origin_alignment: "center_of_component_on_board_surface",
      show_as_translucent_model: true,
      position: { x: -24, y: 8, z: -2.2 },
    },
    {
      type: "pcb_silkscreen_path",
      pcb_silkscreen_path_id: "cad-board-normal-z-frame",
      pcb_component_id: "board1",
      layer: "top",
      route: [
        { x: -45, y: -18 },
        { x: -3, y: -18 },
        { x: -3, y: 34 },
        { x: -45, y: 34 },
        { x: -45, y: -18 },
      ],
      stroke_width: 0.35,
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "cad-board-normal-z-label",
      pcb_component_id: "board1",
      anchor_alignment: "center",
      anchor_position: { x: -24, y: -28 },
      font: "tscircuit2024",
      font_size: 3.5,
      layer: "top",
      text: "board_surface\nz+",
      ccw_rotation: 0,
    },

    {
      type: "pcb_component",
      pcb_component_id: "pcb-board-normal-y",
      source_component_id: "source-board-normal-y",
      center: { x: 24, y: 8 },
      width: 6,
      height: 4,
      layer: "top",
      rotation: 0,
      obstructs_within_bounds: false,
    },
    {
      type: "cad_component",
      cad_component_id: "cad-board-normal-y",
      pcb_component_id: "pcb-board-normal-y",
      source_component_id: "source-board-normal-y",
      model_obj_url: REMOTE_MODEL_URL,
      size: { x: 24, y: 40, z: 18 },
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
      model_board_normal_direction: "y+",
      model_origin_alignment: "center_of_component_on_board_surface",
      show_as_translucent_model: true,
      position: { x: 24, y: 8, z: 0.8 },
    },
    {
      type: "pcb_silkscreen_path",
      pcb_silkscreen_path_id: "cad-board-normal-y-frame",
      pcb_component_id: "board1",
      layer: "top",
      route: [
        { x: 3, y: -18 },
        { x: 45, y: -18 },
        { x: 45, y: 34 },
        { x: 3, y: 34 },
        { x: 3, y: -18 },
      ],
      stroke_width: 0.35,
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "cad-board-normal-y-label",
      pcb_component_id: "board1",
      anchor_alignment: "center",
      anchor_position: { x: 24, y: -28 },
      font: "tscircuit2024",
      font_size: 3.5,
      layer: "top",
      text: "board Surface\ny+",
      ccw_rotation: 0,
    },

    {
      type: "pcb_component",
      pcb_component_id: "pcb-fit-fill",
      source_component_id: "source-fit-fill",
      center: { x: 72, y: 8 },
      width: 6,
      height: 4,
      layer: "top",
      rotation: 0,
      obstructs_within_bounds: false,
    },
    {
      type: "cad_component",
      cad_component_id: "cad-fit-fill",
      pcb_component_id: "pcb-fit-fill",
      source_component_id: "source-fit-fill",
      model_obj_url: REMOTE_MODEL_URL,
      size: { x: 24, y: 40, z: 18 },
      anchor_alignment: "center",
      model_object_fit: "fill_bounds",
      model_origin_alignment: "center_of_component_on_board_surface",
      show_as_translucent_model: true,
      position: { x: 72, y: 8, z: 0.8 },
    },
    {
      type: "pcb_silkscreen_path",
      pcb_silkscreen_path_id: "cad-fit-fill-frame",
      pcb_component_id: "board1",
      layer: "top",
      route: [
        { x: 51, y: -18 },
        { x: 93, y: -18 },
        { x: 93, y: 34 },
        { x: 51, y: 34 },
        { x: 51, y: -18 },
      ],
      stroke_width: 0.35,
    },
    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "cad-fit-fill-label",
      pcb_component_id: "board1",
      anchor_alignment: "center",
      anchor_position: { x: 72, y: -28 },
      font: "tscircuit2024",
      font_size: 3.5,
      layer: "top",
      text: "fill\nboard Surface",
      ccw_rotation: 0,
    },

    {
      type: "pcb_silkscreen_text",
      pcb_silkscreen_text_id: "matrix-title",
      pcb_component_id: "board1",
      anchor_alignment: "center",
      anchor_position: { x: 0, y: -46 },
      font: "tscircuit2024",
      font_size: 2.8,
      layer: "top",
      text: "CAD placement comparison",
      ccw_rotation: 0,
    },
  ]

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 4096,
    includeModels: true,
    showBoundingBoxes: false,
  })

  if (!(glb instanceof ArrayBuffer)) {
    throw new Error(
      "Expected convertCircuitJsonToGltf to return a GLB ArrayBuffer",
    )
  }

  const cameraOptions = getBestCameraPosition(circuitJson)
  const pngBuffer = await renderGLTFToPNGBufferFromGLBBuffer(glb, {
    ...cameraOptions,
    camPos: [
      cameraOptions.camPos[0] * 0.74,
      cameraOptions.camPos[1] * 0.66,
      cameraOptions.camPos[2] * 0.74,
    ],
    backgroundColor: [1, 1, 1],
    supersampling: 2,
  })

  expect(pngBuffer).toMatchPngSnapshot(
    import.meta.path,
    "cad-model-position-params-with-silkscreen",
  )
})
