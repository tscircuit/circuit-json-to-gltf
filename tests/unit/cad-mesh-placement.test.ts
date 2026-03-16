import { expect, test } from "bun:test"
import { getMeshOrigin } from "../../lib/utils/cad-mesh-placement"

test("getMeshOrigin ignores inferred alignment without explicit origin position", () => {
  const origin = getMeshOrigin(
    {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      model_origin_alignment: "center_of_component_on_board_surface",
    },
    {
      min: { x: -2, y: -3, z: -4 },
      max: { x: 6, y: 7, z: 8 },
    },
  )

  expect(origin).toBeNull()
})

test("getMeshOrigin returns explicit model origin position", () => {
  const origin = getMeshOrigin(
    {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      model_origin_alignment: "center_of_component_on_board_surface",
      model_origin_position: { x: 1, y: 2, z: 3 },
    },
    {
      min: { x: -2, y: -3, z: -4 },
      max: { x: 6, y: 7, z: 8 },
    },
  )

  expect(origin).toEqual({ x: 1, y: 2, z: 3 })
})
