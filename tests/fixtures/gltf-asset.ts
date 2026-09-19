export function createGLTFAsset({
  indexed = true,
  normals,
  positions: positionValues = [1, 2, 3, 2, 2, 3, 1, 3, 4],
  graph = {},
}: {
  indexed?: boolean
  normals?: number[]
  positions?: number[]
  graph?: Record<string, unknown>
} = {}) {
  const positions = new Float32Array(positionValues)
  const normalValues = normals ? new Float32Array(normals) : undefined
  const indexOffset = positions.byteLength + (normalValues?.byteLength ?? 0)
  const binary = new ArrayBuffer(indexOffset + (indexed ? 8 : 0))
  new Float32Array(binary, 0, positions.length).set(positions)
  const bufferViews = [
    { buffer: 0, byteOffset: 0, byteLength: positions.byteLength },
  ]
  const accessors = [
    {
      bufferView: 0,
      componentType: 5126,
      count: positions.length / 3,
      type: "VEC3",
    },
  ]
  const attributes: { POSITION: number; NORMAL?: number } = { POSITION: 0 }
  if (normalValues) {
    new Float32Array(binary, positions.byteLength, normalValues.length).set(
      normalValues,
    )
    attributes.NORMAL = accessors.length
    accessors.push({
      bufferView: bufferViews.length,
      componentType: 5126,
      count: 3,
      type: "VEC3",
    })
    bufferViews.push({
      buffer: 0,
      byteOffset: positions.byteLength,
      byteLength: normalValues.byteLength,
    })
  }
  let indices: number | undefined
  if (indexed) {
    new Uint16Array(binary, indexOffset, 3).set([0, 1, 2])
    indices = accessors.length
    accessors.push({
      bufferView: bufferViews.length,
      componentType: 5123,
      count: 3,
      type: "SCALAR",
    })
    bufferViews.push({ buffer: 0, byteOffset: indexOffset, byteLength: 6 })
  }
  const gltf = {
    asset: { version: "2.0" },
    buffers: [{ byteLength: binary.byteLength }],
    bufferViews,
    accessors,
    meshes: [{ primitives: [{ attributes, indices }] }],
    ...graph,
  }
  return { gltf, binary, glb: encodeGLTFAsset(gltf, binary) }
}

export function encodeGLTFAsset(
  gltf: object,
  binary: ArrayBuffer,
): ArrayBuffer {
  const json = new TextEncoder().encode(JSON.stringify(gltf))
  const jsonLength = Math.ceil(json.byteLength / 4) * 4
  const binaryLength = Math.ceil(binary.byteLength / 4) * 4
  const glb = new ArrayBuffer(28 + jsonLength + binaryLength)
  const view = new DataView(glb)
  view.setUint32(0, 0x46546c67, true)
  view.setUint32(4, 2, true)
  view.setUint32(8, glb.byteLength, true)
  view.setUint32(12, jsonLength, true)
  view.setUint32(16, 0x4e4f534a, true)
  new Uint8Array(glb, 20, jsonLength).fill(0x20)
  new Uint8Array(glb, 20, json.byteLength).set(json)
  view.setUint32(20 + jsonLength, binaryLength, true)
  view.setUint32(24 + jsonLength, 0x004e4942, true)
  new Uint8Array(glb, 28 + jsonLength, binary.byteLength).set(
    new Uint8Array(binary),
  )
  return glb
}
