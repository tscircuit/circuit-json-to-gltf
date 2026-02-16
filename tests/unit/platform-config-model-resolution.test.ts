import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"
import { extractPackageInfoFromNodeModulesPath } from "../../lib/loaders/resolve-model-url"

const SIMPLE_ASCII_STL = `solid test
  facet normal 0 0 1
    outer loop
      vertex 0 0 0
      vertex 1 0 0
      vertex 0 1 0
    endloop
  endfacet
endsolid test`

test("platformConfig.resolveProjectStaticFileImportUrl resolves node_modules model URLs", async () => {
  let requestedPath = ""

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
        model_stl_url:
          "./node_modules/@tsci/imrishabh18.library/assets/MachinePinLargeStandard.step.stl",
        position: { x: 0, y: 0, z: 0 },
        size: { x: 1, y: 1, z: 1 },
      },
    ] as const

    const scene = await convertCircuitJsonTo3D(circuit as any, {
      renderBoardTextures: false,
      platformConfig: {
        resolveProjectStaticFileImportUrl: async (path) => {
          requestedPath = path
          return `http://127.0.0.1:${server.port}/resolved-model.stl`
        },
      },
    })

    expect(requestedPath).toBe(
      "node_modules/@tsci/imrishabh18.library/assets/MachinePinLargeStandard.step.stl",
    )
    expect(scene.boxes).toHaveLength(1)
    expect(scene.boxes[0]!.mesh).toBeDefined()
  } finally {
    await server.stop()
  }
})

test("platformConfig.projectBaseUrl resolves /node_modules model URLs", async () => {
  let requestedUrlPath = ""

  const server = Bun.serve({
    port: 0,
    fetch(request) {
      requestedUrlPath = new URL(request.url).pathname
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
        model_stl_url: "/node_modules/some-package/dist/model.stl",
        position: { x: 0, y: 0, z: 0 },
        size: { x: 1, y: 1, z: 1 },
      },
    ] as const

    const scene = await convertCircuitJsonTo3D(circuit as any, {
      renderBoardTextures: false,
      platformConfig: {
        projectBaseUrl: `http://127.0.0.1:${server.port}/`,
      },
    })

    expect(requestedUrlPath).toBe("/node_modules/some-package/dist/model.stl")
    expect(scene.boxes).toHaveLength(1)
    expect(scene.boxes[0]!.mesh).toBeDefined()
  } finally {
    await server.stop()
  }
})

test("extractPackageInfoFromNodeModulesPath parses @tsci scoped paths", () => {
  const info = extractPackageInfoFromNodeModulesPath(
    "./node_modules/@tsci/imrishabh18.library/assets/file.step",
  )

  expect(info).toEqual({
    packageName: "@imrishabh18/library",
    filePath: "assets/file.step",
  })
})
