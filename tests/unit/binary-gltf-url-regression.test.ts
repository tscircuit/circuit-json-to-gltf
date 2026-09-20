import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test.each(["model_glb_url", "model_gltf_url"] as const)(
  "%s accepts binary GLB bytes regardless of URL suffix or content type",
  async (field) => {
    const { glb } = createGLTFAsset({
      graph: {
        scenes: [{ nodes: [0] }],
        nodes: [{ mesh: 0 }],
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
        const cad: CadComponent = {
          type: "cad_component",
          cad_component_id: "cad1",
          pcb_component_id: "pcb1",
          source_component_id: "source1",
          [field]: new URL(path, server.url).href,
          position: { x: 7, y: -11, z: 5 },
          rotation: { x: 0, y: 0, z: 0 },
          model_origin_position: { x: 0, y: 0, z: 0 },
          model_object_fit: "contain_within_bounds",
          anchor_alignment: "center",
        }
        const exported = await convertCircuitJsonToGltf([cad], {
          format: "glb",
          boardTextureResolution: 0,
        })
        if (!(exported instanceof ArrayBuffer)) throw new Error("Expected GLB")
        const mesh = parseGLB(exported, COORDINATE_TRANSFORMS.IDENTITY)
        // Final glTF coordinates, not the exporter's intermediate scene axes.
        expect(mesh.triangles.flatMap((triangle) => triangle.vertices)).toEqual(
          [
            { x: -8, y: 8, z: -9 },
            { x: -9, y: 8, z: -9 },
            { x: -8, y: 9, z: -8 },
          ],
        )
      }
    } finally {
      await server.stop(true)
    }
  },
)
