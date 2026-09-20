import { expect } from "bun:test"
import type { Point3 } from "../../lib/types"

export function scenelessAssetUrl(
  graph: Record<string, unknown> = {},
  meshCount = 1,
): string {
  const positions = new Float32Array([1, 2, 3, 4, 2, 3, 1, 6, 8])
  const gltf = {
    asset: { version: "2.0" },
    buffers: [
      {
        byteLength: positions.byteLength,
        uri: `data:application/octet-stream;base64,${Buffer.from(positions.buffer).toString("base64")}`,
      },
    ],
    bufferViews: [{ buffer: 0, byteLength: positions.byteLength }],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
        min: [1, 2, 3],
        max: [4, 6, 8],
      },
    ],
    meshes: Array.from({ length: meshCount }, () => ({
      primitives: [{ attributes: { POSITION: 0 } }],
    })),
    ...graph,
  }
  return `data:model/gltf+json;base64,${Buffer.from(JSON.stringify(gltf)).toString("base64")}`
}

export function expectScenelessPoints(
  actual: Point3[],
  expected: [number, number, number][],
): void {
  expect(actual).toHaveLength(expected.length)
  for (const [index, point] of actual.entries()) {
    expect(point.x).toBeCloseTo(expected[index]![0], 5)
    expect(point.y).toBeCloseTo(expected[index]![1], 5)
    expect(point.z).toBeCloseTo(expected[index]![2], 5)
  }
}

export const scenelessPlacementGraph = {
  nodes: [
    { translation: [10, 20, 30], scale: [2, 1, 1], children: [1] },
    { mesh: 0, translation: [2, -3, 4] },
  ],
}
