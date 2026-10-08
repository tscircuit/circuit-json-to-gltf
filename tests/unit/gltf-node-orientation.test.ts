import { expect, test } from "bun:test"
import { parseGLB } from "../../lib/loaders/glb"
import type { Point3, Triangle } from "../../lib/types"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

// An off-origin tetrahedron with different lengths on all three axes.
const points: Point3[] = [
  { x: 1, y: 2, z: 3 },
  { x: 4, y: 2, z: 3 },
  { x: 1, y: 6, z: 3 },
  { x: 1, y: 2, z: 8 },
]
const faces = [
  [0, 2, 1],
  [0, 1, 3],
  [0, 3, 2],
  [1, 2, 3],
]

function subtract(a: Point3, b: Point3): Point3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

function cross(a: Point3, b: Point3): Point3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

function dot(a: Point3, b: Point3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

function center(vertices: Point3[]): Point3 {
  return {
    x: vertices.reduce((sum, p) => sum + p.x, 0) / vertices.length,
    y: vertices.reduce((sum, p) => sum + p.y, 0) / vertices.length,
    z: vertices.reduce((sum, p) => sum + p.z, 0) / vertices.length,
  }
}

/** Write a real GLB with independent face vertices for flat outward normals. */
function makeGLB({
  nodes,
  indexed = true,
  includeNormals = true,
  scenes = [{ nodes: [0] }],
  scene = 0,
}: {
  nodes: Record<string, unknown>[]
  indexed?: boolean
  includeNormals?: boolean
  scenes?: { nodes: number[] }[]
  scene?: number
}): ArrayBuffer {
  const positions: number[] = []
  const normals: number[] = []
  for (const indices of faces) {
    const [a, b, c] = indices.map((index) => points[index]!)
    const n = cross(subtract(b!, a!), subtract(c!, a!))
    const length = Math.hypot(n.x, n.y, n.z)
    for (const p of [a!, b!, c!]) {
      positions.push(p.x, p.y, p.z)
      normals.push(n.x / length, n.y / length, n.z / length)
    }
  }

  const parts = [new Float32Array(positions), new Float32Array(normals)]
  const indices = new Uint32Array(Array.from({ length: 12 }, (_, i) => i))
  const positionBytes = parts[0]!.byteLength
  const normalBytes = parts[1]!.byteLength
  const binary = new Uint8Array(
    positionBytes + normalBytes + indices.byteLength,
  )
  binary.set(new Uint8Array(parts[0]!.buffer), 0)
  binary.set(new Uint8Array(parts[1]!.buffer), positionBytes)
  binary.set(new Uint8Array(indices.buffer), positionBytes + normalBytes)

  const gltf = {
    asset: { version: "2.0" },
    scene,
    scenes,
    nodes,
    meshes: [
      {
        primitives: [
          {
            attributes: {
              POSITION: 0,
              ...(includeNormals ? { NORMAL: 1 } : {}),
            },
            ...(indexed ? { indices: 2 } : {}),
          },
        ],
      },
    ],
    buffers: [{ byteLength: binary.byteLength }],
    bufferViews: [
      { buffer: 0, byteOffset: 0, byteLength: positionBytes },
      { buffer: 0, byteOffset: positionBytes, byteLength: normalBytes },
      {
        buffer: 0,
        byteOffset: positionBytes + normalBytes,
        byteLength: indices.byteLength,
      },
    ],
    accessors: [
      { bufferView: 0, componentType: 5126, count: 12, type: "VEC3" },
      { bufferView: 1, componentType: 5126, count: 12, type: "VEC3" },
      { bufferView: 2, componentType: 5125, count: 12, type: "SCALAR" },
    ],
  }
  const json = new TextEncoder().encode(JSON.stringify(gltf))
  const paddedJsonLength = Math.ceil(json.length / 4) * 4
  const buffer = new ArrayBuffer(12 + 8 + paddedJsonLength + 8 + binary.length)
  const view = new DataView(buffer)
  view.setUint32(0, 0x46546c67, true)
  view.setUint32(4, 2, true)
  view.setUint32(8, buffer.byteLength, true)
  view.setUint32(12, paddedJsonLength, true)
  view.setUint32(16, 0x4e4f534a, true)
  new Uint8Array(buffer, 20, paddedJsonLength).fill(0x20)
  new Uint8Array(buffer, 20, json.length).set(json)
  const binaryOffset = 20 + paddedJsonLength
  view.setUint32(binaryOffset, binary.length, true)
  view.setUint32(binaryOffset + 4, 0x004e4942, true)
  new Uint8Array(buffer, binaryOffset + 8).set(binary)
  return buffer
}

function expectOutward(
  triangles: Triangle[],
  expectedPoints: Point3[],
  volume: number,
) {
  expect(triangles).toHaveLength(4)
  const interior = center(expectedPoints)
  let signedVolume = 0
  for (const triangle of triangles) {
    const [a, b, c] = triangle.vertices
    const edge1 = subtract(b, a)
    const edge2 = subtract(c, a)
    const faceNormal = cross(edge1, edge2)
    // For this convex solid, every face must face away from the interior.
    expect(
      dot(faceNormal, subtract(center(triangle.vertices), interior)),
    ).toBeGreaterThan(0)
    expect(dot(faceNormal, triangle.normal)).toBeGreaterThan(0)
    expect(dot(edge1, triangle.normal)).toBeCloseTo(0, 5)
    expect(dot(edge2, triangle.normal)).toBeCloseTo(0, 5)
    expect(
      Math.hypot(triangle.normal.x, triangle.normal.y, triangle.normal.z),
    ).toBeCloseTo(1, 6)
    signedVolume += dot(a, cross(b, c)) / 6
    for (const vertex of triangle.vertices) {
      expect(
        expectedPoints.some(
          (p) =>
            Math.abs(p.x - vertex.x) < 0.00001 &&
            Math.abs(p.y - vertex.y) < 0.00001 &&
            Math.abs(p.z - vertex.z) < 0.00001,
        ),
      ).toBe(true)
    }
  }
  expect(signedVolume).toBeCloseTo(volume, 4)
}

for (const indexed of [true, false]) {
  for (const includeNormals of [true, false]) {
    for (const scale of [
      [2, 3, 0.5],
      [-2, 3, 0.5],
      [-2, -3, 0.5],
      [-2, -3, -0.5],
    ]) {
      test(`GLB node scale ${scale} preserves outward winding (${indexed ? "indexed" : "unindexed"}, ${includeNormals ? "supplied" : "computed"} normals)`, () => {
        const translation = [7, -11, 13]
        const mesh = parseGLB(
          makeGLB({
            nodes: [{ mesh: 0, scale, translation }],
            indexed,
            includeNormals,
          }),
          COORDINATE_TRANSFORMS.IDENTITY,
        )
        const expected = points.map((p) => ({
          x: p.x * scale[0]! + translation[0]!,
          y: p.y * scale[1]! + translation[1]!,
          z: p.z * scale[2]! + translation[2]!,
        }))
        expectOutward(mesh.triangles, expected, 30)
      })
    }
  }
}

test("GLB child transforms apply before parent transforms, including reflected shear", () => {
  const childAngle = (37 * Math.PI) / 180
  const parentAngle = (42 * Math.PI) / 180
  const mesh = parseGLB(
    makeGLB({
      nodes: [
        {
          children: [1],
          translation: [8, 9, 10],
          scale: [2, 3, 0.5],
          rotation: [
            0,
            Math.sin(parentAngle / 2),
            0,
            Math.cos(parentAngle / 2),
          ],
        },
        {
          mesh: 0,
          translation: [3, -2, 1],
          scale: [-1, 2, 4],
          rotation: [0, 0, Math.sin(childAngle / 2), Math.cos(childAngle / 2)],
        },
      ],
    }),
    COORDINATE_TRANSFORMS.IDENTITY,
  )
  const expected = points.map((p) => {
    const x =
      (-p.x * Math.cos(childAngle) - 2 * p.y * Math.sin(childAngle) + 3) * 2
    const y =
      (-p.x * Math.sin(childAngle) + 2 * p.y * Math.cos(childAngle) - 2) * 3
    const z = (4 * p.z + 1) * 0.5
    return {
      x: x * Math.cos(parentAngle) + z * Math.sin(parentAngle) + 8,
      y: y + 9,
      z: -x * Math.sin(parentAngle) + z * Math.cos(parentAngle) + 10,
    }
  })
  expectOutward(mesh.triangles, expected, 240)
})

test("GLB column-major node.matrix bakes reflection, normals and translation", () => {
  const mesh = parseGLB(
    makeGLB({
      nodes: [
        {
          mesh: 0,
          matrix: [0, -2, 0, 0, -3, 0, 0, 0, 0, 0, 0.5, 0, 7, -11, 13, 1],
        },
      ],
    }),
    COORDINATE_TRANSFORMS.IDENTITY,
  )
  expectOutward(
    mesh.triangles,
    points.map((p) => ({
      x: -3 * p.y + 7,
      y: -2 * p.x - 11,
      z: 0.5 * p.z + 13,
    })),
    30,
  )
})

test("GLB transforms come from the selected scene", () => {
  const mesh = parseGLB(
    makeGLB({
      scene: 1,
      scenes: [{ nodes: [0] }, { nodes: [1] }],
      nodes: [
        { mesh: 0, translation: [100, 200, 300] },
        { mesh: 0, translation: [7, -11, 13] },
      ],
    }),
    COORDINATE_TRANSFORMS.IDENTITY,
  )
  expectOutward(
    mesh.triangles,
    points.map((p) => ({ x: p.x + 7, y: p.y - 11, z: p.z + 13 })),
    10,
  )
})

test("GLB collapsed node scales reject undefined surface orientation", () => {
  expect(() =>
    parseGLB(
      makeGLB({ nodes: [{ mesh: 0, scale: [0, 2, 3] }] }),
      COORDINATE_TRANSFORMS.IDENTITY,
    ),
  ).toThrow(RangeError)
})
