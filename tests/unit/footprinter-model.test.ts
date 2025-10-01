import { test, expect } from "bun:test"
import { Buffer } from "node:buffer"
import { convertCircuitJsonTo3D } from "../../lib"

test("cad components load footprinter GLTF models when available", async () => {
  const originalFetch = globalThis.fetch
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
  const base64 = Buffer.from(positions.buffer).toString("base64")
  const gltfModel = {
    asset: { version: "2.0" },
    buffers: [
      {
        uri: `data:application/octet-stream;base64,${base64}`,
        byteLength: positions.byteLength,
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: positions.byteLength,
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
      },
    ],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            mode: 4,
          },
        ],
      },
    ],
  }

  const mockFetch = (async (input: RequestInfo | URL) => {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url

    if (url.endsWith(".glb")) {
      return new Response(null, { status: 404 })
    }
    if (url.endsWith(".gltf")) {
      return new Response(JSON.stringify(gltfModel), {
        status: 200,
        headers: { "content-type": "application/json" },
      })
    }

    throw new Error(`Unexpected fetch url: ${url}`)
  }) as typeof fetch

  mockFetch.preconnect = fetch.preconnect
  globalThis.fetch = mockFetch

  try {
    const circuit = [
      {
        type: "pcb_board",
        pcb_board_id: "board1",
        center: { x: 0, y: 0 },
        width: 20,
        height: 10,
      },
      {
        type: "pcb_component",
        pcb_component_id: "comp1",
        source_component_id: "src1",
        center: { x: 0, y: 0 },
        width: 5,
        height: 5,
      },
      {
        type: "source_component",
        source_component_id: "src1",
        name: "U1",
      },
      {
        type: "cad_component",
        cad_component_id: "cad1",
        pcb_component_id: "comp1",
        footprinter_string: "test_footprinter",
        position: { x: 0, y: 2, z: 0 },
        size: { x: 2, y: 1, z: 2 },
      },
    ]

    const scene = await convertCircuitJsonTo3D(circuit as any, {
      renderBoardTextures: false,
    })

    const modelBox = scene.boxes.find((box) => box.meshType === "gltf")
    expect(modelBox).toBeTruthy()
    expect(modelBox?.mesh?.triangles.length).toBeGreaterThan(0)
  } finally {
    globalThis.fetch = originalFetch
  }
})
