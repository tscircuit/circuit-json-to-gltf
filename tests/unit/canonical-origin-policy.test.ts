import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import type { STLMesh } from "../../lib/types"
import { getMeshOrigin } from "../../lib/utils/cad-mesh-placement"

test("canonical origin inference preserves alignment precedence and contact-height policy", () => {
  const cad: CadComponent = {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    position: { x: 0, y: 0, z: 0 },
    anchor_alignment: "center",
    model_object_fit: "contain_within_bounds",
  }
  const mesh: STLMesh = {
    triangles: [
      {
        vertices: [
          { x: 2, y: 4, z: -3 },
          { x: 2, y: 10, z: -3 },
          { x: 8, y: 4, z: -3 },
        ],
        normal: { x: 0, y: 0, z: -1 },
      },
      {
        vertices: [
          { x: 12, y: 14, z: 5 },
          { x: 16, y: 14, z: 5 },
          { x: 12, y: 20, z: 5 },
        ],
        normal: { x: 0, y: 0, z: 1 },
      },
    ],
    boundingBox: { min: { x: 2, y: 4, z: -3 }, max: { x: 16, y: 20, z: 5 } },
  }
  const contactCad: CadComponent = {
    ...cad,
    model_origin_alignment: "center_of_component_on_board_surface",
  }
  expect(getMeshOrigin(contactCad, mesh)).toEqual({ x: 5, y: 7, z: 0 })
  expect(getMeshOrigin(cad, mesh)).toEqual({ x: 9, y: 12, z: 1 })
  expect(
    getMeshOrigin(
      { ...cad, anchor_alignment: "center_of_component_on_board_surface" },
      mesh,
    ),
  ).toEqual({ x: 5, y: 7, z: 0 })
  expect(
    getMeshOrigin({ ...cad, model_origin_alignment: "unknown" }, mesh),
  ).toEqual({ x: 0, y: 0, z: 0 })
  expect(
    getMeshOrigin(
      { ...contactCad, model_origin_position: { x: 1, y: 2, z: 3 } },
      mesh,
    ),
  ).toEqual({ x: 1, y: 2, z: 3 })
  expect(getMeshOrigin(contactCad, { ...mesh, triangles: [] })).toEqual({
    x: 9,
    y: 12,
    z: 0,
  })
})
