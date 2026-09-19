import { test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import {
  expectScenelessPoints,
  scenelessAssetUrl,
  scenelessPlacementGraph,
} from "../fixtures/sceneless-asset"

const cases = [
  {
    alignment: "center",
    expected: [
      [-4, 2.5, -13],
      [-10, 2.5, -13],
      [-4, 7.5, -9],
    ],
  },
  {
    alignment: "center_of_component_on_board_surface",
    expected: [
      [-4, 42, -11],
      [-10, 42, -11],
      [-4, 47, -7],
    ],
  },
] satisfies {
  alignment: CadComponent["anchor_alignment"]
  expected: [number, number, number][]
}[]
test.each(cases)(
  "sceneless hierarchy precedes retained $alignment origin inference",
  async ({ alignment, expected }) => {
    const cad: CadComponent = {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      model_gltf_url: scenelessAssetUrl(scenelessPlacementGraph),
      position: { x: 7, y: -11, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      model_object_fit: "contain_within_bounds",
      anchor_alignment: alignment,
    }
    const glb = await convertCircuitJsonToGltf([cad], {
      format: "glb",
      boardTextureResolution: 0,
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB")
    const mesh = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
    expectScenelessPoints(
      mesh.triangles.flatMap((triangle) => triangle.vertices),
      expected,
    )
  },
)
