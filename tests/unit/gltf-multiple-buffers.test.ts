import { expect, test } from "bun:test"
import { fetchGltfAndConvertToGlb, loadGLTF } from "../../lib/loaders/gltf"

const dataUrl = (data: Uint8Array) =>
  `data:application/octet-stream;base64,${Buffer.from(data).toString("base64")}`

const createModel = (indicesFirst: boolean, viewOffset = 0) => {
  const positions = new Float32Array([1, 2, 3, 5, 2, 3, 1, 7, 3])
  const indices = new Uint16Array([0, 1, 2])
  const positionBytes = new Uint8Array(positions.byteLength + viewOffset)
  const indexBytes = new Uint8Array(indices.byteLength + viewOffset)
  positionBytes.set(new Uint8Array(positions.buffer), viewOffset)
  indexBytes.set(new Uint8Array(indices.buffer), viewOffset)
  const buffers = indicesFirst
    ? [indexBytes, positionBytes]
    : [positionBytes, indexBytes]
  return {
    asset: { version: "2.0" },
    buffers: buffers.map((data) => ({
      byteLength: data.length,
      uri: dataUrl(data),
    })),
    bufferViews: [
      {
        buffer: indicesFirst ? 1 : 0,
        byteOffset: viewOffset,
        byteLength: positions.byteLength,
        target: 34962,
      },
      {
        buffer: indicesFirst ? 0 : 1,
        byteOffset: viewOffset,
        byteLength: indices.byteLength,
        target: 34963,
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
        min: [1, 2, 3],
        max: [5, 7, 3],
      },
      { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
    ],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    nodes: [{ mesh: 0 }],
    scenes: [{ nodes: [0] }],
    scene: 0,
  }
}

const modelUrl = (model: object) =>
  `data:application/json,${encodeURIComponent(JSON.stringify(model))}`

test.each([false, true])(
  "loads geometry split between buffers (indices first: %j)",
  async (indicesFirst) => {
    const model = createModel(indicesFirst)
    const mesh = await loadGLTF({ url: modelUrl(model), transform: {} })
    expect(mesh.triangles).toHaveLength(1)
    expect(mesh.triangles[0]?.vertices).toEqual([
      { x: 1, y: 2, z: 3 },
      { x: 5, y: 2, z: 3 },
      { x: 1, y: 7, z: 3 },
    ])
  },
)

test("packs every buffer on a four-byte boundary and retains buffer-view offsets", async () => {
  const model = createModel(true, 4)
  const packed = await fetchGltfAndConvertToGlb(modelUrl(model))
  const view = new DataView(packed)
  const jsonLength = view.getUint32(12, true)
  const json = JSON.parse(
    new TextDecoder().decode(new Uint8Array(packed, 20, jsonLength)),
  )
  expect(json.buffers).toEqual([{ byteLength: 52 }])
  expect(
    json.bufferViews.map((entry: any) => [entry.buffer, entry.byteOffset]),
  ).toEqual([
    [0, 16],
    [0, 4],
  ])
  const binaryStart = 20 + jsonLength + 8
  expect(Array.from(new Uint8Array(packed, binaryStart, 10))).toEqual(
    Array.from(new Uint8Array([0, 0, 0, 0, 0, 0, 1, 0, 2, 0])),
  )
  expect(view.getFloat32(binaryStart + 16, true)).toBe(1)
  const mesh = await loadGLTF({ url: modelUrl(model), transform: {} })
  expect(mesh.boundingBox).toEqual({
    min: { x: 1, y: 2, z: 3 },
    max: { x: 5, y: 7, z: 3 },
  })
})
