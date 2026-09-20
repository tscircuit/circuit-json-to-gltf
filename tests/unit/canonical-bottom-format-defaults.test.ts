import { expect, test } from "bun:test"
import type { CadComponent, PcbComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("implicit bottom orientation retains the exporter's per-format policy in project axes", async () => {
  const obj = "v 1 2 3\nv 2 2 3\nv 1 3 4\nf 1 2 3\n"
  const sources = [
    {
      model_obj_url: `data:text/plain;base64,${Buffer.from(obj).toString("base64")}`,
    },
    {
      model_glb_url: `data:model/gltf-binary;base64,${Buffer.from(createGLTFAsset().glb).toString("base64")}`,
    },
    { footprinter_string: "soic8" },
  ]
  const pcb: PcbComponent = {
    type: "pcb_component",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    center: { x: 0, y: 0 },
    width: 2,
    height: 4,
    rotation: 0,
    layer: "bottom",
    obstructs_within_bounds: true,
  }
  for (const [index, model] of sources.entries()) {
    for (const rotation of [undefined, { x: 0, y: 0, z: 0 }]) {
      const cad: CadComponent = {
        type: "cad_component",
        cad_component_id: "cad1",
        pcb_component_id: "pcb1",
        source_component_id: "source1",
        position: { x: 0, y: 0, z: -0.7 },
        anchor_alignment: "center",
        model_object_fit: "contain_within_bounds",
        model_origin_position: { x: 0, y: 0, z: 0 },
        ...model,
        rotation,
      }
      const scene = await convertCircuitJsonTo3D([pcb, cad], {
        renderBoardTextures: false,
      })
      expect(scene.boxes[0]!.rotation).toEqual(
        rotation ??
          (index === 0
            ? { x: Math.PI, y: 0, z: 0 }
            : { x: 0, y: Math.PI, z: 0 }),
      )
    }
  }
})
