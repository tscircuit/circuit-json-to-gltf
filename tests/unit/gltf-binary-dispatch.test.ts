import { expect, test } from "bun:test"
import { loadGLTF } from "../../lib/loaders/gltf"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("gltfUrl accepts GLB bytes independently of URL suffix or content type", async () => {
  const { glb } = createGLTFAsset({
    graph: {
      scenes: [{ nodes: [0, 1] }],
      nodes: [
        { mesh: 0, translation: [10, 20, 30] },
        { mesh: 0, translation: [-10, -20, -30] },
      ],
    },
  })
  const server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch: () =>
      new Response(glb, { headers: { "Content-Type": "application/json" } }),
  })
  try {
    for (const path of ["asset.gltf", "download?asset=123"]) {
      const mesh = await loadGLTF({ url: new URL(path, server.url).href })
      expect(mesh.triangles).toHaveLength(2)
      expect(mesh.triangles.map((t) => t.vertices[0])).toEqual([
        { x: 11, y: 22, z: 33 },
        { x: -9, y: -18, z: -27 },
      ])
    }
    const mapped = await loadGLTF({
      url: new URL("asset.gltf", server.url).href,
      transform: { rotation: { z: 90 } },
    })
    expect(mapped.triangles[0]!.vertices[0].x).toBeCloseTo(-22, 9)
    expect(mapped.triangles[0]!.vertices[0].y).toBeCloseTo(11, 9)
    expect(mapped.triangles[0]!.vertices[0].z).toBeCloseTo(33, 9)
  } finally {
    await server.stop(true)
  }
})
