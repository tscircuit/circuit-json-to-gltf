import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"

test("STL model normalization preserves the upstream physical orientation in canonical axes", async () => {
  const stl = `solid probe
facet normal 0 0 1
outer loop
vertex 1 2 3
vertex 2 2 3
vertex 1 3 3
endloop
endfacet
endsolid probe`
  const cad: CadComponent = {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    position: { x: 0, y: 0, z: 0 },
    model_stl_url: `data:model/stl;base64,${Buffer.from(stl).toString("base64")}`,
    model_origin_position: { x: 0, y: 0, z: 0 },
    anchor_alignment: "center",
    model_object_fit: "contain_within_bounds",
  }
  const scene = await convertCircuitJsonTo3D([cad], {
    renderBoardTextures: false,
  })
  expect(scene.boxes[0]!.mesh!.triangles[0]!.vertices).toEqual([
    { x: 1, y: -2, z: -3 },
    { x: 2, y: -2, z: -3 },
    { x: 1, y: -3, z: -3 },
  ])
})
