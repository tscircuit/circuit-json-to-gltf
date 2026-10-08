import { expect, test } from "bun:test"
import {
  createBoxMesh,
  type MeshData,
  transformMesh,
} from "../../lib/gltf/geometry"
import type { Point3, STLMesh, Triangle } from "../../lib/types"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import {
  type LinearTransform3,
  linearTransformFromPointTransform,
  transformTriangle,
} from "../../lib/utils/mesh-orientation"
import { scaleMesh, scaleMeshByAxis } from "../../lib/utils/mesh-scale"

const subtract = (a: Point3, b: Point3): Point3 => ({
  x: a.x - b.x,
  y: a.y - b.y,
  z: a.z - b.z,
})
const cross = (a: Point3, b: Point3): Point3 => ({
  x: a.y * b.z - a.z * b.y,
  y: a.z * b.x - a.x * b.z,
  z: a.x * b.y - a.y * b.x,
})
const dot = (a: Point3, b: Point3) => a.x * b.x + a.y * b.y + a.z * b.z
const normalOf = (vertices: Triangle["vertices"]): Point3 => {
  const [a, b, c] = vertices
  const n = cross(subtract(b, a), subtract(c, a))
  const length = Math.hypot(n.x, n.y, n.z)
  return { x: n.x / length, y: n.y / length, z: n.z / length }
}
const signedVolume = (triangles: Triangle[]) =>
  triangles.reduce(
    (volume, { vertices: [a, b, c] }) => volume + dot(a, cross(b, c)) / 6,
    0,
  )

// A tetrahedron has a slanted face as well as three axis-aligned ones. Uniform
// boxes alone cannot expose incorrect normals after scaling unequal axes.
const a = { x: 0, y: 0, z: 0 }
const b = { x: 2, y: 0, z: 0 }
const c = { x: 0, y: 3, z: 0 }
const d = { x: 0, y: 0, z: 5 }
const tetraTriangles = [
  [a, c, b],
  [a, b, d],
  [a, d, c],
  [b, c, d],
].map(
  (vertices): Triangle => ({
    vertices: vertices as Triangle["vertices"],
    normal: normalOf(vertices as Triangle["vertices"]),
    uvs: [
      { u: 0, v: 0 },
      { u: 1, v: 0 },
      { u: 0, v: 1 },
    ],
  }),
)
const tetrahedron: STLMesh = {
  triangles: tetraTriangles,
  boundingBox: boundsOfTriangles(tetraTriangles),
}

function expectSurfaceNormals(triangles: Triangle[]) {
  for (const {
    vertices: [a, b, c],
    normal,
  } of triangles) {
    const edge1 = subtract(b, a)
    const edge2 = subtract(c, a)
    expect(dot(normal, edge1)).toBeCloseTo(0, 10)
    expect(dot(normal, edge2)).toBeCloseTo(0, 10)
    expect(Math.hypot(normal.x, normal.y, normal.z)).toBeCloseTo(1, 10)
    expect(dot(cross(edge1, edge2), normal)).toBeGreaterThan(0)
  }
}

test.each([
  { x: 2, y: 3, z: 4 },
  { x: -2, y: 3, z: 4 },
  { x: -2, y: -3, z: 4 },
])(
  "unequal scale %j preserves outward faces and perpendicular unit normals",
  (scale) => {
    const before = structuredClone(tetrahedron)
    const result = scaleMeshByAxis(tetrahedron, scale)
    expect(signedVolume(result.triangles)).toBeCloseTo(120, 10)
    expectSurfaceNormals(result.triangles)
    expect(result.boundingBox.min.x).toBe(Math.min(0, 2 * scale.x))
    expect(result.boundingBox.max.x).toBe(Math.max(0, 2 * scale.x))
    for (let i = 0; i < result.triangles.length; i++) {
      const source = tetrahedron.triangles[i]!
      const scaled = result.triangles[i]!
      for (let j = 0; j < 3; j++) {
        const position = scaled.vertices[j]!
        const originalIndex = source.vertices.findIndex(
          (point) =>
            point.x * scale.x === position.x &&
            point.y * scale.y === position.y &&
            point.z * scale.z === position.z,
        )
        expect(scaled.uvs![j]).toEqual(source.uvs![originalIndex])
      }
    }
    expect(tetrahedron).toEqual(before)
  },
)

test("negative uniform scale keeps ordered bounds and outward winding", () => {
  const result = scaleMesh(tetrahedron, -2)
  expect(signedVolume(result.triangles)).toBeCloseTo(40, 10)
  expectSurfaceNormals(result.triangles)
  expect(result.boundingBox).toEqual({
    min: { x: -4, y: -6, z: -10 },
    max: { x: 0, y: 0, z: 0 },
  })
})

function meshDataTriangles(mesh: MeshData): Triangle[] {
  const pointAt = (values: number[], index: number): Point3 => ({
    x: values[index * 3]!,
    y: values[index * 3 + 1]!,
    z: values[index * 3 + 2]!,
  })
  const triangles: Triangle[] = []
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const indices = mesh.indices.slice(i, i + 3)
    triangles.push({
      vertices: indices.map((index) =>
        pointAt(mesh.positions, index),
      ) as Triangle["vertices"],
      normal: pointAt(mesh.normals, indices[0]!),
    })
  }
  return triangles
}

test("transformMesh preserves a reflected box's volume after rotation and translation", () => {
  const box = createBoxMesh({ x: 2, y: 3, z: 5 })
  const before = structuredClone(box)
  const result = transformMesh(
    box,
    { x: 4, y: -2, z: 7 },
    { x: 0.27, y: -0.43, z: 0.61 },
    { x: -2, y: 3, z: 4 },
  )
  const triangles = meshDataTriangles(result)
  expect(signedVolume(triangles)).toBeCloseTo(720, 8)
  expectSurfaceNormals(triangles)
  expect(result.texcoords).toEqual(box.texcoords)
  expect(box).toEqual(before)
})

test("transformMesh scales slanted normals before applying rotations", () => {
  const triangle = tetraTriangles[3]!
  const mesh: MeshData = {
    positions: triangle.vertices.flatMap(({ x, y, z }) => [x, y, z]),
    normals: triangle.vertices.flatMap(() => [
      triangle.normal.x,
      triangle.normal.y,
      triangle.normal.z,
    ]),
    indices: [0, 1, 2],
    texcoords: [0, 0, 1, 0, 0, 1],
  }
  const result = transformMesh(
    mesh,
    { x: 3, y: 1, z: -7 },
    { x: 0.19, y: 0.37, z: -0.23 },
    { x: 2, y: 3, z: -4 },
  )
  expectSurfaceNormals(meshDataTriangles(result))
})

test("inverse-transpose normals remain perpendicular after shear and reflection", () => {
  const matrix: LinearTransform3 = [-2, 1, 0, 0, 3, 1, 0, 0, 4]
  const result = tetraTriangles.map((triangle) =>
    transformTriangle(triangle, matrix),
  )
  expectSurfaceNormals(result)
  expect(signedVolume(result)).toBeCloseTo(120, 10)
})

test("linear extraction removes translation from directions", () => {
  const matrix = linearTransformFromPointTransform(({ x, y, z }) => ({
    x: -2 * x + y + 17,
    y: 3 * y + z - 21,
    z: 4 * z + 8,
  }))
  const result = tetraTriangles.map((triangle) =>
    transformTriangle(triangle, matrix),
  )
  expectSurfaceNormals(result)
  expect(signedVolume(result)).toBeCloseTo(120, 10)
  expect(result[0]!.vertices[0]).toEqual({ x: 0, y: 0, z: 0 })
})

test("collapsed scale fails explicitly instead of emitting invalid surface normals", () => {
  expect(() => scaleMesh(tetrahedron, 0)).toThrow(/nonzero determinant/)
  expect(() => scaleMeshByAxis(tetrahedron, { x: 0, y: 2, z: 3 })).toThrow(
    /nonzero determinant/,
  )
  expect(() =>
    transformMesh(createBoxMesh({ x: 2, y: 3, z: 5 }), a, undefined, {
      x: 2,
      y: 0,
      z: 3,
    }),
  ).toThrow(/nonzero determinant/)
})
