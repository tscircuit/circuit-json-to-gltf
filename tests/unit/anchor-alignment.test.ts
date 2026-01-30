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

const makeBaseCircuit = (modelUrl: string) => [
  {
    type: "pcb_board",
    pcb_board_id: "board1",
    center: { x: 0, y: 0 },
    width: 20,
    height: 20,
    thickness: 1.6,
  },
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
    width: 2,
    height: 2,
    layer: "top",
  },
  {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    model_stl_url: modelUrl,
    position: { x: 0, y: 0, z: 123 },
    rotation: { x: 0, y: 0, z: 0 },
    size: { x: 1, y: 1, z: 1 },
    anchor_alignment: "xy_center_z_board",
  },
] as const

test("anchor_alignment xy_center_z_board snaps SMT to board surface", async () => {
  const server = Bun.serve({
    port: 0,
    fetch() {
      return new Response(SIMPLE_ASCII_STL, {
        headers: { "Content-Type": "model/stl" },
      })
    },
  })

  try {
    const circuit = makeBaseCircuit(`http://127.0.0.1:${server.port}/model.stl`)
    const scene = await convertCircuitJsonTo3D(circuit as any, {
      renderBoardTextures: false,
    })

    const meshBox = scene.boxes.find((box) => Boolean(box.meshUrl))
    expect(meshBox).toBeDefined()
    expect(meshBox!.center.y).toBeCloseTo(1.8)
  } finally {
    await server.stop()
  }
})

test("anchor_alignment xy_center_z_board keeps through-hole origin on board", async () => {
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
      ...makeBaseCircuit(`http://127.0.0.1:${server.port}/model.stl`),
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "hole1",
        pcb_component_id: "pcb1",
        pcb_port_id: "port1",
        layers: ["top"],
        x: 0,
        y: 0,
        hole_diameter: 0.6,
        outer_diameter: 1.2,
      },
    ] as const

    const scene = await convertCircuitJsonTo3D(circuit as any, {
      renderBoardTextures: false,
    })

    const meshBox = scene.boxes.find((box) => Boolean(box.meshUrl))
    expect(meshBox).toBeDefined()
    expect(meshBox!.center.y).toBeCloseTo(0.8)
  } finally {
    await server.stop()
  }
})
