import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import {
  prepareBoardGeometry,
  type PreparedGeometryOccurrence,
} from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

function tetrahedronGlb(scaleX: number): string {
  const positions = new Float32Array([1, 2, 3, 5, 2, 3, 1, 8, 3, 1, 2, 7])
  const indices = new Uint16Array([0, 2, 1, 0, 1, 3, 1, 2, 3, 2, 0, 3])
  const binary = new Uint8Array(positions.byteLength + indices.byteLength)
  binary.set(new Uint8Array(positions.buffer))
  binary.set(new Uint8Array(indices.buffer), positions.byteLength)
  const json = JSON.stringify({
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, scale: [scaleX, 1, 1] }],
    meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
    buffers: [{ byteLength: binary.byteLength }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positions.byteLength },
      {
        buffer: 0,
        byteOffset: positions.byteLength,
        byteLength: indices.byteLength,
      },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 4, type: "VEC3" },
      { bufferView: 1, componentType: 5123, count: 12, type: "SCALAR" },
    ],
  })
  const paddedJson = new TextEncoder().encode(
    json.padEnd(Math.ceil(json.length / 4) * 4, " "),
  )
  const buffer = new ArrayBuffer(12 + 8 + paddedJson.length + 8 + binary.length)
  const view = new DataView(buffer)
  view.setUint32(0, 0x46546c67, true)
  view.setUint32(4, 2, true)
  view.setUint32(8, buffer.byteLength, true)
  view.setUint32(12, paddedJson.length, true)
  view.setUint32(16, 0x4e4f534a, true)
  new Uint8Array(buffer, 20, paddedJson.length).set(paddedJson)
  view.setUint32(20 + paddedJson.length, binary.length, true)
  view.setUint32(24 + paddedJson.length, 0x004e4942, true)
  new Uint8Array(buffer, 28 + paddedJson.length).set(binary)
  return `data:model/gltf-binary;base64,${Buffer.from(buffer).toString("base64")}`
}

function placedVolume(body: PreparedGeometryOccurrence): number {
  if (body.status !== "available") throw new Error(body.reason)
  const m = body.boardFromMesh
  const determinant =
    m[0] * (m[5] * m[10] - m[6] * m[9]) -
    m[4] * (m[1] * m[10] - m[2] * m[9]) +
    m[8] * (m[1] * m[6] - m[2] * m[5])
  let volume = 0
  for (const triangle of body.mesh.triangles) {
    const vertices = triangle.vertices.map((v) => ({
      x: m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12],
      y: m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13],
      z: m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14],
    }))
    if (determinant < 0 !== !!triangle.windingReversed) vertices.reverse()
    const [a, b, c] = vertices
    volume +=
      (a!.x * (b!.y * c!.z - b!.z * c!.y) +
        a!.y * (b!.z * c!.x - b!.x * c!.z) +
        a!.z * (b!.x * c!.y - b!.y * c!.x)) /
      6
  }
  return volume
}

test("shared reflection parity preserves outward solid volume for JSCAD, OBJ and mirrored GLB nodes", async () => {
  const cases: { cad: Partial<CadComponent>; volume: number }[] = [
    {
      cad: {
        model_obj_url: undefined,
        model_jscad: { type: "cuboid", size: [2, 4, 4] },
      },
      volume: 32,
    },
    { cad: {}, volume: 16 },
    {
      cad: { model_obj_url: undefined, model_glb_url: tetrahedronGlb(1) },
      volume: 16,
    },
    {
      cad: { model_obj_url: undefined, model_glb_url: tetrahedronGlb(-1) },
      volume: 16,
    },
  ]
  for (const { cad, volume } of cases) {
    for (const normal of ["x+", "x-", "y+", "y-", "z+", "z-"] as const) {
      const prepared = await prepareBoardGeometry({
        circuitJson: geometryCircuit({
          ...cad,
          model_board_normal_direction: normal,
        }),
        pcbBoardId: "board",
      })
      expect(placedVolume(prepared.components[0]!)).toBeCloseTo(volume, 9)
      expect(
        placedVolume(JSON.parse(JSON.stringify(prepared.components[0]))),
      ).toBeCloseTo(volume, 9)
      expect(placedVolume(prepared.board)).toBeCloseTo(20 * 16 * 1.6, 9)
    }
  }
})
