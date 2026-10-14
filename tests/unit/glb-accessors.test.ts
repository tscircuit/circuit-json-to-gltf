import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

function makeGLB(
  gltf: Record<string, unknown>,
  binary: ArrayBuffer,
): ArrayBuffer {
  const json = new TextEncoder().encode(
    JSON.stringify({
      asset: { version: "2.0" },
      scenes: [{ nodes: [0] }],
      nodes: [{ mesh: 0 }],
      buffers: [{ byteLength: binary.byteLength }],
      ...gltf,
    }),
  )
  const jsonLength = Math.ceil(json.length / 4) * 4
  const binaryLength = Math.ceil(binary.byteLength / 4) * 4
  const buffer = new ArrayBuffer(28 + jsonLength + binaryLength)
  const view = new DataView(buffer)
  view.setUint32(0, 0x46546c67, true)
  view.setUint32(4, 2, true)
  view.setUint32(8, buffer.byteLength, true)
  view.setUint32(12, jsonLength, true)
  view.setUint32(16, 0x4e4f534a, true)
  new Uint8Array(buffer, 20, jsonLength).fill(0x20)
  new Uint8Array(buffer, 20, json.length).set(json)
  view.setUint32(20 + jsonLength, binaryLength, true)
  view.setUint32(24 + jsonLength, 0x004e4942, true)
  new Uint8Array(buffer, 28 + jsonLength).set(new Uint8Array(binary))
  return buffer
}

const points: [number, number, number][] = [
  [1, 2, 3],
  [4, 2, 3],
  [1, 6, 3],
]

for (const indexType of [undefined, 5121, 5123, 5125]) {
  test(`GLB interleaved positions, normals and colors respect offsets (indices ${indexType ?? "none"})`, () => {
    const binary = new ArrayBuffer(112)
    const view = new DataView(binary)
    // Nonzero bufferView offset, separate accessor offsets and 4-byte padding.
    for (let i = 0; i < 3; i++) {
      const offset = 4 + i * 32
      points[i]!.forEach((value, c) =>
        view.setFloat32(offset + c * 4, value, true),
      )
      view.setFloat32(offset + 20, 1, true)
      new Uint8Array(binary, offset + 24, 4).set([64, 128, 255, 128])
      view.setUint32(offset + 28, 0xdeadbeef, true)
    }
    const indexSize = indexType === 5121 ? 1 : indexType === 5123 ? 2 : 4
    for (let i = 0; i < 3; i++) {
      if (indexType === 5121) view.setUint8(100 + i, i)
      else if (indexType === 5123) view.setUint16(100 + i * 2, i, true)
      else view.setUint32(100 + i * 4, i, true)
    }
    const mesh = parseGLB(
      makeGLB(
        {
          meshes: [
            {
              primitives: [
                {
                  attributes: { POSITION: 0, NORMAL: 1, COLOR_0: 2 },
                  ...(indexType ? { indices: 3 } : {}),
                },
              ],
            },
          ],
          bufferViews: [
            { buffer: 0, byteOffset: 4, byteLength: 96, byteStride: 32 },
            { buffer: 0, byteOffset: 100, byteLength: 3 * indexSize },
          ],
          accessors: [
            { bufferView: 0, componentType: 5126, count: 3, type: "VEC3" },
            {
              bufferView: 0,
              byteOffset: 12,
              componentType: 5126,
              count: 3,
              type: "VEC3",
            },
            {
              bufferView: 0,
              byteOffset: 24,
              componentType: 5121,
              normalized: true,
              count: 3,
              type: "VEC4",
            },
            {
              bufferView: 1,
              componentType: indexType ?? 5125,
              count: 3,
              type: "SCALAR",
            },
          ],
        },
        binary,
      ),
      COORDINATE_TRANSFORMS.IDENTITY,
    )
    expect(mesh.triangles).toHaveLength(1)
    const triangle = mesh.triangles[0]!
    for (let i = 0; i < 3; i++) {
      const [x, y, z] = points[i]!
      expect(triangle.vertices[i]).toEqual({ x, y, z })
    }
    expect(triangle.normal).toEqual({ x: 0, y: 0, z: 1 })
    expect(triangle.color!.slice(0, 3)).toEqual([64, 128, 255])
    expect(triangle.color![3]).toBeCloseTo(128 / 255, 6)
  })
}

for (const { componentType, min, max, middle } of [
  { componentType: 5120, min: -128, max: 127, middle: 64 },
  { componentType: 5121, min: 0, max: 255, middle: 128 },
  { componentType: 5122, min: -32768, max: 32767, middle: 16384 },
  { componentType: 5123, min: 0, max: 65535, middle: 32768 },
]) {
  for (const normalized of [true, false]) {
    for (const padded of [true, false]) {
      test(`GLB component ${componentType}, normalized=${normalized}, padded=${padded}`, () => {
        const size = componentType <= 5121 ? 1 : 2
        const stride = padded ? 4 * size : 3 * size
        const binary = new ArrayBuffer(4 + 3 * stride)
        const view = new DataView(binary)
        const values = [
          [min, 0, middle],
          [max, 0, middle],
          [min, max, middle],
        ]
        values.forEach((p, i) =>
          p.forEach((value, c) => {
            const offset = 4 + i * stride + c * size
            if (componentType === 5120) view.setInt8(offset, value)
            else if (componentType === 5121) view.setUint8(offset, value)
            else if (componentType === 5122) view.setInt16(offset, value, true)
            else view.setUint16(offset, value, true)
          }),
        )
        const mesh = parseGLB(
          makeGLB(
            {
              extensionsUsed: ["KHR_mesh_quantization"],
              extensionsRequired: ["KHR_mesh_quantization"],
              meshes: [{ primitives: [{ attributes: { POSITION: 0 } }] }],
              bufferViews: [
                {
                  buffer: 0,
                  byteOffset: 4,
                  byteLength: 3 * stride,
                  ...(padded ? { byteStride: stride } : {}),
                },
              ],
              accessors: [
                {
                  bufferView: 0,
                  componentType,
                  normalized,
                  count: 3,
                  type: "VEC3",
                },
              ],
            },
            binary,
          ),
          COORDINATE_TRANSFORMS.IDENTITY,
        )
        const vertices = mesh.triangles[0]!.vertices
        expect(vertices[0].x).toBe(normalized ? (min < 0 ? -1 : 0) : min)
        expect(vertices[1].x).toBe(normalized ? 1 : max)
        expect(vertices[2].y).toBe(normalized ? 1 : max)
        for (const vertex of vertices)
          expect(vertex.z).toBeCloseTo(normalized ? middle / max : middle, 6)
      })
    }
  }
}

test("GLB normalized UNSIGNED_SHORT RGB colors map to display colors", () => {
  const binary = new ArrayBuffer(56)
  new Float32Array(binary, 0, 9).set(points.flat())
  new Uint16Array(binary, 36, 9).set([
    65535, 0, 32768, 65535, 0, 32768, 65535, 0, 32768,
  ])
  const mesh = parseGLB(
    makeGLB(
      {
        meshes: [{ primitives: [{ attributes: { POSITION: 0, COLOR_0: 1 } }] }],
        bufferViews: [
          { buffer: 0, byteLength: 36 },
          { buffer: 0, byteOffset: 36, byteLength: 18 },
        ],
        accessors: [
          { bufferView: 0, componentType: 5126, count: 3, type: "VEC3" },
          {
            bufferView: 1,
            componentType: 5123,
            normalized: true,
            count: 3,
            type: "VEC3",
          },
        ],
      },
      binary,
    ),
    COORDINATE_TRANSFORMS.IDENTITY,
  )
  expect(mesh.triangles[0]!.color).toEqual([255, 0, 128, 1])
})
