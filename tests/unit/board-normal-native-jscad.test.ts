import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"

test("JSCAD preparation uses its actual fixed loader mapping for normals and origins", async () => {
  const cad: CadComponent = {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    position: { x: 0, y: 0, z: 0 },
    model_jscad: {
      type: "translate",
      vector: [1, 2, 3],
      shape: { type: "cuboid", size: [2, 4, 6] },
    },
    model_origin_position: { x: 1, y: 2, z: 3 },
    model_board_normal_direction: "z-",
    model_object_fit: "contain_within_bounds",
    anchor_alignment: "center",
  }
  for (const coordinateTransform of [undefined, { rotation: { x: 17 } }]) {
    const scene = await convertCircuitJsonTo3D([cad], {
      renderBoardTextures: false,
      coordinateTransform,
    })
    const bounds = scene.boxes[0]!.mesh!.boundingBox
    for (const [key, sign] of [
      ["min", -1],
      ["max", 1],
    ] as const) {
      expect(bounds[key].x).toBeCloseTo(sign, 10)
      expect(bounds[key].y).toBeCloseTo(sign * 3, 10)
      expect(bounds[key].z).toBeCloseTo(sign * 2, 10)
    }
  }
})
