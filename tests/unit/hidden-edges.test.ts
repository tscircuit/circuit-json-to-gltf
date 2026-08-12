import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"

test("carries cad_component.show_hidden_edges into PoppyGL node extras", async () => {
  const circuit = [
    {
      type: "source_component",
      source_component_id: "source_enclosure",
      name: "enclosure",
      supplier_part_numbers: {},
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_enclosure",
      source_component_id: "source_enclosure",
      center: { x: 0, y: 0 },
      width: 10,
      height: 10,
      layer: "top",
      rotation: 0,
    },
    {
      type: "cad_component",
      cad_component_id: "cad_enclosure",
      pcb_component_id: "pcb_enclosure",
      source_component_id: "source_enclosure",
      position: { x: 0, y: 0, z: 0 },
      size: { x: 10, y: 10, z: 10 },
      model_jscad: { type: "cuboid", size: [10, 10, 10] },
      show_hidden_edges: true,
    },
  ]

  const scene = await convertCircuitJsonTo3D(circuit as any, {
    renderBoardTextures: false,
  })
  expect(scene.boxes[0]?.showHiddenEdges).toBe(true)

  const gltf = (await convertSceneToGLTF(scene, { binary: false })) as {
    nodes: Array<{ name?: string; extras?: unknown }>
  }
  expect(gltf.nodes.find((node) => node.name === "enclosure")?.extras).toEqual({
    poppygl: { showHiddenEdges: true },
  })
})
