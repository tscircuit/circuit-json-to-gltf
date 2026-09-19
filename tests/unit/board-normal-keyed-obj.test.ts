import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { getBoundingBoxCenter } from "../../lib/utils/mesh-scale"
import {
  getKeyedModelTriangles,
  isKeyTriangle,
  KEYED_CAD_MODEL_URL,
} from "../fixtures/keyed-cad-model"

const cases = [
  ["z+", [1.5, 1, 2]],
  ["z-", [1.5, -1, -2]],
  ["x+", [-2, 1, 1.5]],
  ["x-", [2, 1, -1.5]],
  ["y+", [1.5, -2, 1]],
  ["y-", [1.5, 2, -1]],
] as const

test.each(cases)(
  "%s native board normal keeps the asymmetric OBJ key on the right-handed side",
  async (direction, expected) => {
    // The existing asset's red key is centered at native (1.5,1,2).
    // Expected centers follow the canonical proper rotations to project +Z.
    const cad: CadComponent = {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      position: { x: 7, y: -11, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      model_obj_url: KEYED_CAD_MODEL_URL,
      model_origin_position: { x: 0, y: 0, z: 0 },
      model_board_normal_direction: direction,
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
    }
    const glb = await convertCircuitJsonToGltf([cad], {
      format: "glb",
      boardTextureResolution: 0,
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB")
    const key = getKeyedModelTriangles(glb).filter(isKeyTriangle)
    expect(key).toHaveLength(12)
    const center = getBoundingBoxCenter(boundsOfTriangles(key))
    // Observe final G=(-P.x,P.z,P.y), unchanged between exporter versions.
    expect(center.x).toBeCloseTo(-(7 + expected[0]), 5)
    expect(center.y).toBeCloseTo(5 + expected[2], 5)
    expect(center.z).toBeCloseTo(-11 + expected[1], 5)
  },
)
