import { expect } from "bun:test"
import type { GLTF } from "../../lib/gltf/gltf-types"
import type { Point3, Triangle } from "../../lib/types"

export function assertOutward(triangles: Triangle[], expectedVolume?: number) {
  expect(triangles.length).toBeGreaterThan(0)
  let volume = 0
  for (const {
    vertices: [a, b, c],
    normal,
  } of triangles) {
    const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
    const ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
    const cross = {
      x: ab.y * ac.z - ab.z * ac.y,
      y: ab.z * ac.x - ab.x * ac.z,
      z: ab.x * ac.y - ab.y * ac.x,
    }
    expect(
      cross.x * normal.x + cross.y * normal.y + cross.z * normal.z,
    ).toBeGreaterThan(0)
    volume += (a.x * cross.x + a.y * cross.y + a.z * cross.z) / 6
  }
  if (expectedVolume !== undefined)
    expect(volume).toBeCloseTo(expectedVolume, 3)
  return volume
}

export function readExportedTriangles(glb: ArrayBuffer): Triangle[] {
  const view = new DataView(glb)
  const jsonLength = view.getUint32(12, true)
  const gltf: GLTF = JSON.parse(
    new TextDecoder().decode(new Uint8Array(glb, 20, jsonLength)),
  )
  const binaryOffset = 20 + jsonLength + 8
  const read = (index: number) => {
    const a = gltf.accessors![index]!,
      b = gltf.bufferViews![a.bufferView!]!
    const offset = binaryOffset + (b.byteOffset ?? 0) + (a.byteOffset ?? 0)
    const n = a.count * (a.type === "VEC3" ? 3 : a.type === "VEC2" ? 2 : 1)
    if (a.componentType === 5126) return new Float32Array(glb, offset, n)
    if (a.componentType === 5125) return new Uint32Array(glb, offset, n)
    if (a.componentType === 5123) return new Uint16Array(glb, offset, n)
    return new Uint8Array(glb, offset, n)
  }
  const triangles: Triangle[] = []
  for (const mesh of gltf.meshes ?? [])
    for (const primitive of mesh.primitives) {
      const positions = read(primitive.attributes.POSITION),
        normals = read(primitive.attributes.NORMAL!),
        indices = read(primitive.indices!)
      for (let i = 0; i < indices.length; i += 3) {
        const vertices = [0, 1, 2].map((j) => {
          const k = indices[i + j]! * 3
          return {
            x: positions[k]!,
            y: positions[k + 1]!,
            z: positions[k + 2]!,
          }
        }) as Triangle["vertices"]
        const k = indices[i]! * 3
        triangles.push({
          vertices,
          normal: { x: normals[k]!, y: normals[k + 1]!, z: normals[k + 2]! },
        })
      }
    }
  return triangles
}

export const tetrahedron: Triangle[] = (() => {
  const points: Point3[] = [
    { x: 1, y: 2, z: 3 },
    { x: 5, y: 2, z: 3 },
    { x: 1, y: 5, z: 3 },
    { x: 1, y: 2, z: 5 },
  ]
  return [
    [0, 2, 1],
    [0, 1, 3],
    [0, 3, 2],
    [1, 2, 3],
  ].map((face) => {
    const [a, b, c] = face.map((i) => points[i]!) as Triangle["vertices"]
    const ab = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z },
      ac = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
    const n = {
      x: ab.y * ac.z - ab.z * ac.y,
      y: ab.z * ac.x - ab.x * ac.z,
      z: ab.x * ac.y - ab.y * ac.x,
    }
    const length = Math.hypot(n.x, n.y, n.z)
    return {
      vertices: [a, b, c],
      normal: { x: n.x / length, y: n.y / length, z: n.z / length },
    }
  })
})()

// Construct a source asset directly; don't rely on the exporter being tested.
export function tetrahedronGltf() {
  const positions = new Float32Array(
    tetrahedron.flatMap((t) => t.vertices.flatMap((v) => [v.x, v.y, v.z])),
  )
  const normals = new Float32Array(
    tetrahedron.flatMap((t) =>
      t.vertices.flatMap(() => [t.normal.x, t.normal.y, t.normal.z]),
    ),
  )
  const binary = Buffer.concat([
    Buffer.from(positions.buffer),
    Buffer.from(normals.buffer),
  ])
  return {
    asset: { version: "2.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      { primitives: [{ attributes: { POSITION: 0, NORMAL: 1 }, mode: 4 }] },
    ],
    buffers: [
      {
        byteLength: binary.length,
        uri: `data:application/octet-stream;base64,${binary.toString("base64")}`,
      },
    ],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positions.byteLength },
      {
        buffer: 0,
        byteOffset: positions.byteLength,
        byteLength: normals.byteLength,
      },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 12, type: "VEC3" },
      { bufferView: 1, componentType: 5126, count: 12, type: "VEC3" },
    ],
  }
}
