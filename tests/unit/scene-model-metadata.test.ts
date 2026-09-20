import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("scene metadata names the GLB selected when both model URL fields exist", async () => {
  const { glb } = createGLTFAsset()
  const modelUrl = `data:model/gltf-binary;base64,${Buffer.from(glb).toString("base64")}`
  const cad: CadComponent = {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    position: { x: 0, y: 0, z: 0 },
    model_glb_url: modelUrl,
    model_gltf_url: "data:application/json,not-the-selected-model",
    model_origin_position: { x: 0, y: 0, z: 0 },
    model_object_fit: "contain_within_bounds",
    anchor_alignment: "center",
  }
  const scene = await convertCircuitJsonTo3D([cad], {
    renderBoardTextures: false,
  })
  expect(scene.boxes[0]!.meshUrl).toBe(modelUrl)
  expect(scene.boxes[0]!.meshType).toBe("glb")
  expect(scene.boxes[0]!.mesh!.triangles).toHaveLength(1)
})
