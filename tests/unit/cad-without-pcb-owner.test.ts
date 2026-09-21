import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"

test("standalone CAD renders without a board or PCB owner", async () => {
  const cad: CadComponent = {
    type: "cad_component",
    cad_component_id: "cad1",
    source_component_id: "source1",
    position: { x: 3, y: 4, z: 5 },
    rotation: { x: 0, y: 0, z: 0 },
    layer: "bottom",
    model_jscad: { type: "cuboid", size: [2, 3, 4] },
    model_object_fit: "contain_within_bounds",
    anchor_alignment: "center",
  }
  const scene = await convertCircuitJsonTo3D([cad], {
    renderBoardTextures: false,
  })
  expect(scene.boxes).toHaveLength(1)
  expect(scene.boxes[0]!.center).toEqual({ x: 3, y: 5, z: 4 })
  expect(scene.boxes[0]!.mesh?.triangles.length).toBeGreaterThan(0)
})
