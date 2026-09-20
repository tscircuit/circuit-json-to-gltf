import { expect, test } from "bun:test"
import { getMeshOrigin } from "../../lib/utils/cad-mesh-placement"

test("getMeshOrigin infers board-surface origin from the contact patch", () => {
  const origin = getMeshOrigin(
    {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      position: { x: 0, y: 0, z: 0 },
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
      model_origin_alignment: "center_of_component_on_board_surface",
    },
    {
      triangles: [
        {
          vertices: [
            { x: -2, y: -1, z: -3 },
            { x: 6, y: -1, z: -3 },
            { x: -2, y: 1, z: -3 },
          ],
          normal: { x: 0, y: 0, z: -1 },
        },
        {
          vertices: [
            { x: 6, y: -1, z: -3 },
            { x: 6, y: 1, z: -3 },
            { x: -2, y: 1, z: -3 },
          ],
          normal: { x: 0, y: 0, z: -1 },
        },
      ],
      boundingBox: {
        min: { x: -2, y: -4, z: -3 },
        max: { x: 6, y: 8, z: 7 },
      },
    },
  )

  expect(origin).toEqual({ x: 2, y: 0, z: 0 })
})

test("getMeshOrigin returns explicit model origin position", () => {
  const origin = getMeshOrigin(
    {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      position: { x: 0, y: 0, z: 0 },
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
      model_origin_alignment: "center_of_component_on_board_surface",
      model_origin_position: { x: 1, y: 2, z: 3 },
    },
    {
      triangles: [],
      boundingBox: {
        min: { x: -2, y: -3, z: -4 },
        max: { x: 6, y: 7, z: 8 },
      },
    },
  )

  expect(origin).toEqual({ x: 1, y: 2, z: 3 })
})
