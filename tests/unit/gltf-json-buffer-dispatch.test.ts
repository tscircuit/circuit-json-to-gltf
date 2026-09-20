import { expect, test } from "bun:test"
import { loadGLTF } from "../../lib/loaders/gltf"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("JSON glTF still resolves external and data URI buffers after byte dispatch", async () => {
  const { gltf, binary } = createGLTFAsset({
    graph: {
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0, translation: [10, 20, 30] }],
    },
  })
  const requested: string[] = []
  const server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch(request) {
      const path = new URL(request.url).pathname
      requested.push(path)
      if (path === "/models/mesh.bin") return new Response(binary)
      return Response.json({
        ...gltf,
        buffers: [
          {
            byteLength: binary.byteLength,
            uri:
              path === "/models/external.glb"
                ? "mesh.bin"
                : `data:application/octet-stream;base64,${Buffer.from(binary).toString("base64")}`,
          },
        ],
      })
    },
  })
  try {
    for (const path of ["models/external.glb", "models/embedded"]) {
      const mesh = await loadGLTF({
        url: new URL(path, server.url).href,
        transform: COORDINATE_TRANSFORMS.IDENTITY,
      })
      expect(mesh.triangles).toHaveLength(1)
      expect(mesh.triangles[0]!.vertices).toEqual([
        { x: 11, y: 22, z: 33 },
        { x: 12, y: 22, z: 33 },
        { x: 11, y: 23, z: 34 },
      ])
    }
    expect(requested).toEqual([
      "/models/external.glb",
      "/models/mesh.bin",
      "/models/embedded",
    ])
  } finally {
    await server.stop(true)
  }
})
