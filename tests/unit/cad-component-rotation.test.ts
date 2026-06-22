import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"
import { getCadComponentSceneRotation } from "../../lib/converters/circuit-to-3d"

const SIMPLE_ASCII_STL = `solid test
  facet normal 0 0 1
    outer loop
      vertex 0 0 1
      vertex 1 0 0
      vertex 0 1 0
    endloop
  endfacet
endsolid test`

const expectRadians = (actual: number | undefined, degrees: number) => {
  expect(actual).toBeCloseTo((degrees * Math.PI) / 180)
}

test("cad component rotations inherit pcb component rotation when cad rotation is missing", async () => {
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
        name: "R1",
      },
      {
        type: "pcb_component",
        pcb_component_id: "pcb1",
        source_component_id: "source1",
        center: { x: 0, y: 0 },
        width: 1,
        height: 1,
        layer: "top",
        rotation: 45,
      },
      {
        type: "cad_component",
        cad_component_id: "cad1",
        pcb_component_id: "pcb1",
        source_component_id: "source1",
        model_stl_url: `http://127.0.0.1:${server.port}/model.stl`,
      },
    ] as const

    const scene = await convertCircuitJsonTo3D(circuit as any, {
      renderBoardTextures: false,
    })

    expect(scene.boxes).toHaveLength(1)
    expectRadians(scene.boxes[0]!.rotation?.y, 45)
  } finally {
    await server.stop()
  }
})

test("bottom-layer cad component rotation combines layer flip and mirrored pcb rotation", () => {
  const rotation = getCadComponentSceneRotation({
    cad: {},
    pcbComponent: { rotation: 45 },
    isBottomLayer: true,
    usesGlbModelRotation: true,
  })

  expectRadians(rotation?.x, 0)
  expectRadians(rotation?.y, -45)
  expectRadians(rotation?.z, 180)
})

test("explicit cad rotation keeps existing circuit-json axis remapping", () => {
  const rotation = getCadComponentSceneRotation({
    cad: { rotation: { x: 10, y: 20, z: 30 } },
    pcbComponent: { rotation: 45 },
    isBottomLayer: false,
    usesGlbModelRotation: false,
  })

  expectRadians(rotation?.x, 10)
  expectRadians(rotation?.y, 30)
  expectRadians(rotation?.z, 20)
})
