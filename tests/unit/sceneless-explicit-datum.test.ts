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

test("an explicit asset-root datum is applied after the complete sceneless hierarchy", async () => {
  const cad: CadComponent = {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    model_gltf_url: scenelessAssetUrl(scenelessPlacementGraph),
    position: { x: 7, y: -11, z: 5 },
    rotation: { x: 0, y: 0, z: 0 },
    model_origin_position: { x: 16, y: 19, z: 37 },
    model_object_fit: "contain_within_bounds",
    anchor_alignment: "center",
  }
  const glb = await convertCircuitJsonToGltf([cad], {
    format: "glb",
    boardTextureResolution: 0,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB")
  const mesh = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
  // The first authored vertex lands exactly at the CAD anchor in final glTF.
  expectScenelessPoints(
    mesh.triangles.flatMap((triangle) => triangle.vertices),
    [
      [-7, 5, -11],
      [-13, 5, -11],
      [-7, 10, -7],
    ],
  )
})
