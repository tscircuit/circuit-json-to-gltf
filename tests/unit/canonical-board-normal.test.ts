import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"

test("all board-normal directions rotate units and explicit datums before placement", async () => {
  const model = "v 4 5 6\nv 6 5 6\nv 4 9 14\nf 1 2 3\n"
  const directions = [
    ["z+", [7, 8, 9]],
    ["z-", [7, -8, -9]],
    ["x+", [-9, 8, 7]],
    ["x-", [9, 8, -7]],
    ["y+", [7, -9, 8]],
    ["y-", [7, 9, -8]],
  ] as const
  for (const [direction, expected] of directions) {
    const cad: CadComponent = {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      position: { x: 0, y: 0, z: 0 },
      model_obj_url: `data:text/plain;base64,${Buffer.from(model).toString("base64")}`,
      model_unit_to_mm_scale_factor: 2,
      model_board_normal_direction: direction,
      model_origin_position: { x: 1, y: 2, z: 3 },
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
    }
    const scene = await convertCircuitJsonTo3D([cad], {
      renderBoardTextures: false,
    })
    const point = scene.boxes[0]!.mesh!.triangles[0]!.vertices[0]
    expect(point.x).toBeCloseTo(expected[0], 10)
    expect(point.y).toBeCloseTo(expected[1], 10)
    expect(point.z).toBeCloseTo(expected[2], 10)
  }
})
