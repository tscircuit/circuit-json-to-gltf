import { expect, test } from "bun:test"
import { prepareBoardGeometry } from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("external glTF buffers use the same scoped fetch and credentials as the model document", async () => {
  const binary = new Float32Array([1, 2, 3, 5, 2, 3, 1, 8, 3]).buffer
  const requested: string[] = []
  const prepared = await prepareBoardGeometry({
    circuitJson: geometryCircuit({
      model_obj_url: undefined,
      model_gltf_url: "memory://project/models/model.gltf",
    }),
    pcbBoardId: "board",
    assetContext: {
      authHeaders: { Authorization: "local-test-context" },
      fetch: async (url, init) => {
        requested.push(url)
        expect(new Headers(init?.headers).get("Authorization")).toBe(
          "local-test-context",
        )
        if (url.endsWith("vertices.bin")) return new Response(binary)
        return Response.json({
          asset: { version: "2.0" },
          buffers: [{ uri: "vertices.bin", byteLength: binary.byteLength }],
          bufferViews: [
            { buffer: 0, byteOffset: 0, byteLength: binary.byteLength },
          ],
          accessors: [
            { bufferView: 0, componentType: 5126, count: 3, type: "VEC3" },
          ],
          meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
        })
      },
    },
  })
  expect(requested).toEqual([
    "memory://project/models/model.gltf",
    "memory://project/models/vertices.bin",
  ])
  expect(prepared.components[0]?.status).toBe("available")
  expect(JSON.stringify(prepared)).not.toContain("local-test-context")
})
