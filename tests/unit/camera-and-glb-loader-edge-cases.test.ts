import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import { getBestCameraPosition } from "../../lib/utils/camera-position"

const createGlbBuffer = (gltf: unknown, binBytes: Uint8Array): ArrayBuffer => {
  const jsonBytes = new TextEncoder().encode(JSON.stringify(gltf))
  const jsonPad = (4 - (jsonBytes.length % 4)) % 4
  const binPad = (4 - (binBytes.length % 4)) % 4
  const totalLength =
    12 + 8 + jsonBytes.length + jsonPad + 8 + binBytes.length + binPad
  const buffer = new ArrayBuffer(totalLength)
  const view = new DataView(buffer)
  let offset = 0

  view.setUint32(offset, 0x46546c67, true)
  offset += 4
  view.setUint32(offset, 2, true)
  offset += 4
  view.setUint32(offset, totalLength, true)
  offset += 4

  view.setUint32(offset, jsonBytes.length + jsonPad, true)
  offset += 4
  view.setUint32(offset, 0x4e4f534a, true)
  offset += 4
  new Uint8Array(buffer, offset, jsonBytes.length).set(jsonBytes)
  offset += jsonBytes.length
  for (let i = 0; i < jsonPad; i++) {
    view.setUint8(offset++, 0x20)
  }

  view.setUint32(offset, binBytes.length + binPad, true)
  offset += 4
  view.setUint32(offset, 0x004e4942, true)
  offset += 4
  new Uint8Array(buffer, offset, binBytes.length).set(binBytes)
  return buffer
}

test("getBestCameraPosition fits boards along vertical custom direction vectors and derives outline bounds", () => {
  const verticalCam = getBestCameraPosition(
    [
      {
        type: "pcb_board",
        pcb_board_id: "pcb_board_1",
        width: 40,
        height: 20,
        thickness: 1.6,
        num_layers: 2,
        center: { x: 0, y: 0 },
        material: "fr4",
      },
    ],
    { direction: [0, 1, 0] },
  )

  expect(verticalCam.camPos[1]).toBeGreaterThan(20)

  const outlineCam = getBestCameraPosition([
    {
      type: "pcb_board",
      pcb_board_id: "pcb_board_outline",
      width: 0,
      height: 0,
      thickness: 1.6,
      num_layers: 2,
      center: { x: 10, y: 20 },
      outline: [
        { x: -10, y: 10 },
        { x: 30, y: 10 },
        { x: 30, y: 30 },
        { x: -10, y: 30 },
      ],
      material: "fr4",
    },
  ])

  expect(outlineCam.lookAt).toEqual([-10, 0, 20])
  expect(outlineCam.camPos[1]).toBeGreaterThan(20)
})

test("parseGLB supports unaligned FLOAT accessors and multi-node mesh instancing without scenes array", () => {
  const rawBin = new ArrayBuffer(2 + 36)
  const rawView = new DataView(rawBin)
  // 2 bytes of padding so the FLOAT positions bufferView starts at byteOffset = 2 (unaligned)
  rawView.setUint16(0, 0, true)
  const coords = [0, 0, 0, 1, 0, 0, 0, 1, 0]
  coords.forEach((value, index) => {
    rawView.setFloat32(2 + index * 4, value, true)
  })

  const gltf = {
    asset: { version: "2.0" },
    nodes: [
      { mesh: 0, translation: [0, 0, 0] },
      { mesh: 0, translation: [10, 0, 0] },
    ],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 2,
        byteLength: 36,
      },
    ],
    buffers: [{ byteLength: 38 }],
  }

  const parsed = parseGLB(createGlbBuffer(gltf, new Uint8Array(rawBin)))
  expect(parsed.triangles).toHaveLength(2)
  expect(parsed.boundingBox.min.x).toBeCloseTo(0, 5)
  expect(parsed.boundingBox.max.x).toBeCloseTo(11, 5)
})
