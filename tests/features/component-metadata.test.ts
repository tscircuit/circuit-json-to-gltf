import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D, convertSceneToGLTF } from "../../lib"
import type { GLTF } from "../../lib/gltf/gltf-types"

const stl = `solid probe
facet normal 0 0 1
outer loop
vertex 0 0 0
vertex 2 0 0
vertex 0 3 0
endloop
endfacet
endsolid probe`

test("component identity survives conversion to both glTF and binary GLB", async () => {
  const circuitJson = [
    { type: "source_component", source_component_id: "source1", name: "U1" },
    ...["cad1", "cad2"].map((id, i) => ({
      type: "cad_component",
      cad_component_id: id,
      source_component_id: "source1",
      pcb_component_id: "pcb1",
      position: { x: 5 + i * 10, y: 7, z: 3 },
      rotation: { x: 0, y: 0, z: 0 },
      model_stl_url: `data:model/stl,${encodeURIComponent(stl)}`,
      show_hidden_edges: true,
    })),
  ] as CircuitJson
  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
    drawFauxBoard: false,
  })
  expect(scene.boxes).toHaveLength(2)
  for (const binary of [false, true]) {
    const result = await convertSceneToGLTF(scene, { binary })
    const gltf: GLTF =
      result instanceof ArrayBuffer
        ? JSON.parse(
            new TextDecoder().decode(
              new Uint8Array(
                result,
                20,
                new DataView(result).getUint32(12, true),
              ),
            ),
          )
        : (result as GLTF)
    for (const [i, node] of gltf.nodes!.entries()) {
      expect(node.name).toBe("U1")
      expect(node.extras?.tscircuit).toEqual({
        cad_component_id: `cad${i + 1}`,
        source_component_id: "source1",
        pcb_component_id: "pcb1",
        componentName: "U1",
      })
      expect(node.extras?.poppygl?.showHiddenEdges).toBe(true)
      expect(node.extras?.tscircuit).not.toHaveProperty("circuitJson")
    }
  }
})

test("mechanical components keep CAD identity without PCB or source records", async () => {
  const scene = await convertCircuitJsonTo3D(
    [
      {
        type: "cad_component",
        cad_component_id: "case",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        model_stl_url: `data:model/stl,${encodeURIComponent(stl)}`,
      },
    ] as CircuitJson,
    { renderBoardTextures: false, drawFauxBoard: false },
  )
  const gltf = (await convertSceneToGLTF(scene)) as any
  expect(gltf.nodes[0].extras.tscircuit.cad_component_id).toBe("case")
  expect(gltf.nodes[0].extras.tscircuit.pcb_component_id).toBeUndefined()
  expect(gltf.nodes[0].extras.poppygl).toBeUndefined()
})
