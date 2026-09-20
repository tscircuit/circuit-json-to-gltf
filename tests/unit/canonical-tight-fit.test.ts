import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("fitting retains vertex-tight bounds rather than the viewer's transformed source boxes", async () => {
  const { glb } = createGLTFAsset({
    positions: [0, 0, 0, 2, 0, 0, 0, 1, 0],
    graph: {
      scenes: [{ nodes: [0] }],
      nodes: [
        {
          mesh: 0,
          rotation: [0, 0, Math.sin(Math.PI / 8), Math.cos(Math.PI / 8)],
        },
      ],
    },
  })
  const cad: CadComponent = {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    position: { x: 0, y: 0, z: 0 },
    model_glb_url: `data:model/gltf-binary;base64,${Buffer.from(glb).toString("base64")}`,
    model_origin_position: { x: 0, y: 0, z: 0 },
    anchor_alignment: "center",
    size: { x: 3, y: 4, z: 1 },
    model_object_fit: "fill_bounds",
  }
  const scene = await convertCircuitJsonTo3D([cad], {
    renderBoardTextures: false,
  })
  const vertices = scene.boxes[0]!.mesh!.triangles[0]!.vertices
  // A 45-degree node rotation gives tight extents (3/sqrt(2),sqrt(2),0).
  // Transforming the source AABB instead would incorrectly enlarge Y to 3/sqrt(2).
  const expected = [
    [0, 0, 0],
    [2, 4, 0],
    [-1, 2, 0],
  ]
  for (const [index, vertex] of vertices.entries()) {
    expect(vertex.x).toBeCloseTo(expected[index]![0]!, 8)
    expect(vertex.y).toBeCloseTo(expected[index]![1]!, 8)
    expect(vertex.z).toBeCloseTo(expected[index]![2]!, 8)
  }
})
