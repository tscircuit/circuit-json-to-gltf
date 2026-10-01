import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { prepareBoardGeometry } from "../../lib/geometry"
import { parseGLB } from "../../lib/loaders/glb"
import { fetchGltfAndConvertToGlb } from "../../lib/loaders/gltf"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("strict GLB and glTF preparation reject node matrices and repeated instances even after legacy cache warming", async () => {
  const binary = Buffer.from(
    new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]).buffer,
  )
  for (const fixture of [
    {
      nodes: [
        { mesh: 0, matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 7, 0, 0, 1] },
      ],
      roots: [0],
      error: "node.matrix",
    },
    {
      nodes: [{ mesh: 0 }, { mesh: 0, translation: [7, 0, 0] }],
      roots: [0, 1],
      error: "Repeated glTF mesh instances",
    },
  ]) {
    const gltfUrl = `data:application/json,${encodeURIComponent(
      JSON.stringify({
        asset: { version: "2.0" },
        scenes: [{ nodes: fixture.roots }],
        nodes: fixture.nodes,
        buffers: [
          {
            uri: `data:application/octet-stream;base64,${binary.toString("base64")}`,
            byteLength: binary.byteLength,
          },
        ],
        bufferViews: [
          { buffer: 0, byteOffset: 0, byteLength: binary.byteLength },
        ],
        accessors: [
          { bufferView: 0, componentType: 5126, count: 3, type: "VEC3" },
        ],
        meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
      }),
    )}`
    const glb = await fetchGltfAndConvertToGlb(gltfUrl)
    expect(() => parseGLB(glb, undefined, true)).toThrow(fixture.error)
    for (const model of [
      {
        model_glb_url: `data:model/gltf-binary;base64,${Buffer.from(glb).toString("base64")}`,
      },
      { model_gltf_url: gltfUrl },
    ]) {
      const circuitJson = geometryCircuit({
        model_obj_url: undefined,
        ...model,
      })
      const scene = await convertCircuitJsonTo3D(circuitJson, {
        renderBoardTextures: false,
      })
      expect(scene.boxes[1]?.mesh?.triangles.length).toBeGreaterThan(0)
      await expect(
        prepareBoardGeometry({ circuitJson, pcbBoardId: "board" }),
      ).rejects.toThrow("Failed to prepare")
    }
  }
})
