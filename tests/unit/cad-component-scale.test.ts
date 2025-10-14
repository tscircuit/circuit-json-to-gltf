import { test, expect } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"

const SIMPLE_ASCII_STL = `solid test
  facet normal 0 0 1
    outer loop
      vertex 0 0 1
      vertex 1 0 0
      vertex 0 1 0
    endloop
  endfacet
  facet normal 0 0 -1
    outer loop
      vertex 0 0 1
      vertex 0 1 0
      vertex 1 0 0
    endloop
  endfacet
endsolid test`

test("model_unit_to_mm_scale_factor scales meshes and sizes", async () => {
  const server = Bun.serve({
    port: 0,
    fetch() {
      return new Response(SIMPLE_ASCII_STL, {
        headers: { "Content-Type": "model/stl" },
      })
    },
  })

  try {
    const circuit = [
      {
        type: "source_component",
        source_component_id: "source1",
        name: "Test",
      },
      {
        type: "pcb_component",
        pcb_component_id: "pcb1",
        source_component_id: "source1",
        center: { x: 0, y: 0 },
        width: 1,
        height: 1,
        layer: "top",
      },
      {
        type: "cad_component",
        cad_component_id: "cad1",
        pcb_component_id: "pcb1",
        model_stl_url: `http://127.0.0.1:${server.port}/model.stl`,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        size: { x: 1, y: 1, z: 1 },
        model_unit_to_mm_scale_factor: 2,
      },
    ] as const

    const scene = await convertCircuitJsonTo3D(circuit as any, {
      renderBoardTextures: false,
    })

    expect(scene.boxes).toHaveLength(1)
    const box = scene.boxes[0]!

    expect(box.size.x).toBeCloseTo(2)
    expect(box.size.y).toBeCloseTo(2)
    expect(box.size.z).toBeCloseTo(2)

    expect(box.mesh).toBeDefined()
    expect(box.mesh!.boundingBox.max.x).toBeCloseTo(2)
    expect(box.mesh!.boundingBox.min.x).toBeCloseTo(0)
  } finally {
    await server.stop()
  }
})
