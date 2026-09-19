import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("GLB rejects invalid node graphs rather than losing their geometry", () => {
  const cases = [
    { graph: { nodes: [{ mesh: 0 }] }, error: "Missing glTF scene" },
    {
      graph: { scenes: [{ nodes: [3] }], nodes: [{ mesh: 0 }] },
      error: "Missing glTF node",
    },
    {
      graph: { scenes: [{ nodes: [0] }], nodes: [{ mesh: 3 }] },
      error: "Missing glTF mesh",
    },
    {
      graph: { scenes: [{ nodes: [0] }], nodes: [{ children: [0] }] },
      error: "Cycle in glTF node hierarchy",
    },
    {
      graph: { scenes: [{ nodes: [0] }], nodes: [{ mesh: 0, matrix: [1] }] },
      error: "Invalid glTF node matrix",
    },
  ]
  for (const { graph, error } of cases) {
    expect(() => parseGLB(createGLTFAsset({ graph }).glb)).toThrow(error)
  }
})
