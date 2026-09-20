import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("GLB rejects invalid node graphs rather than losing their geometry", () => {
  const cases = [
    { graph: { scene: 0 }, error: "Missing glTF scene" },
    {
      graph: { scene: 0, nodes: [{ mesh: 0 }] },
      error: "Missing glTF scene",
    },
    {
      graph: { scene: 1, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }] },
      error: "Missing glTF scene",
    },
    {
      graph: { scene: -1, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }] },
      error: "Missing glTF scene",
    },
    {
      graph: { scene: 0.5, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }] },
      error: "Missing glTF scene",
    },
    {
      graph: { scene: null, scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }] },
      error: "Missing glTF scene",
    },
    {
      graph: { scenes: [], nodes: [{ mesh: 0 }] },
      error: "Missing glTF scene",
    },
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
    {
      graph: { nodes: [{ mesh: 0, children: [3] }] },
      error: "Missing glTF node",
    },
    {
      graph: { nodes: [{ mesh: 0, children: [-1] }] },
      error: "Missing glTF node",
    },
    { graph: { nodes: [{ mesh: 3 }] }, error: "Missing glTF mesh" },
    { graph: { nodes: [{ mesh: -1 }] }, error: "Missing glTF mesh" },
    {
      graph: { nodes: [{ mesh: 0, children: [0] }] },
      error: "Cycle in glTF node hierarchy",
    },
    {
      graph: { nodes: [{ mesh: 0, children: [1] }, { children: [0] }] },
      error: "Cycle in glTF node hierarchy",
    },
    {
      graph: {
        nodes: [{ mesh: 0 }, { children: [2] }, { children: [1] }],
      },
      error: "Cycle in glTF node hierarchy",
    },
    {
      graph: {
        nodes: [{ children: [2] }, { children: [2] }, { mesh: 0 }],
      },
      error: "Multiple parents for glTF node",
    },
    {
      graph: {
        scenes: [{ nodes: [0, 1] }],
        nodes: [{ children: [2] }, { children: [2] }, { mesh: 0 }],
      },
      error: "Multiple parents for glTF node",
    },
    {
      graph: { nodes: [{ children: [1, 1] }, { mesh: 0 }] },
      error: "Multiple parents for glTF node",
    },
    {
      graph: { scenes: [{ nodes: [0, 0] }], nodes: [{ mesh: 0 }] },
      error: "Multiple parents for glTF node",
    },
    {
      graph: {
        scenes: [{ nodes: [1] }],
        nodes: [{ children: [1] }, { mesh: 0 }],
      },
      error: "Multiple parents for glTF node",
    },
    {
      graph: { nodes: [{ mesh: 0, matrix: [1] }] },
      error: "Invalid glTF node matrix",
    },
  ]
  for (const { graph, error } of cases) {
    expect(() => parseGLB(createGLTFAsset({ graph }).glb)).toThrow(error)
  }
})
