import { expect, test } from "bun:test"
import { extrudePolygon } from "@tscircuit/flex-utils"
import {
  createMeshFromSTL,
  convertMeshToGLTFOrientation,
  type MeshData,
} from "../../lib/gltf/geometry"
import type { Box3D, Point3, STLMesh, Triangle } from "../../lib/types"
import { foldRigidBox } from "../../lib/utils/fold-rigid-box"
import {
  createPcbFold,
  swapMeshFrame,
  type PcbBendRecord,
} from "../../lib/utils/pcb-fold"

const boardCenter = { x: 23, y: -17 }
const bend: PcbBendRecord = {
  type: "pcb_bend",
  pcb_bend_id: "bend",
  pcb_board_id: "board",
  start: { x: 0, y: -10 },
  end: { x: 0, y: 10 },
  bend_angle: 90,
  bend_radius: 1,
  bend_side: "right",
}

// An off-origin solid makes axis reflections and UV/vertex mixups observable.
const makeMesh = (): STLMesh => {
  const mesh = swapMeshFrame(
    extrudePolygon({
      outline: [
        { x: 0.2, y: -0.7 },
        { x: 1.3, y: -0.7 },
        { x: 1.3, y: 0.9 },
        { x: 0.2, y: 0.9 },
      ],
      bottom: 0.15,
      top: 0.65,
    }),
  )
  mesh.triangles = mesh.triangles.map((triangle, index) => ({
    ...triangle,
    color: [0.2, 0.4, 0.8, 1],
    materialIndex: index,
    uvs: triangle.vertices.map((_, corner) => ({
      u: index + corner / 10,
      v: -index - corner / 10 - 0.123,
    })) as Triangle["uvs"],
  }))
  return mesh
}

const makeBox = (moving: boolean, bottom: boolean, angle: number): Box3D => ({
  center: {
    x: boardCenter.x + (moving ? 8 : -8),
    y: bottom ? -1 : 1,
    z: boardCenter.y + 2,
  },
  size: { x: 1.1, y: 0.5, z: 1.6 },
  rotation: {
    x: bottom ? Math.PI : 0,
    y: (angle * Math.PI) / 180,
    z: 0,
  },
  mesh: makeMesh(),
  label: "off-axis solid",
})

const cross = (a: Point3, b: Point3, c: Point3): Point3 => {
  const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z }
  const v = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
  return {
    x: u.y * v.z - u.z * v.y,
    y: u.z * v.x - u.x * v.z,
    z: u.x * v.y - u.y * v.x,
  }
}

const volume = (triangles: Triangle[]) =>
  triangles.reduce((sum, { vertices: [a, b, c] }) => {
    const n = cross({ x: 0, y: 0, z: 0 }, b, c)
    return sum + (a.x * n.x + a.y * n.y + a.z * n.z) / 6
  }, 0)

const expectOutward = (mesh: STLMesh) => {
  // A closed 1.1 x 0.5 x 1.6 mm solid has positive oriented volume.
  expect(volume(mesh.triangles)).toBeCloseTo(0.88, 6)
  for (const {
    vertices: [a, b, c],
    normal,
  } of mesh.triangles) {
    const n = cross(a, b, c)
    const agreement =
      (n.x * normal.x + n.y * normal.y + n.z * normal.z) /
      Math.hypot(n.x, n.y, n.z)
    expect(agreement).toBeCloseTo(1, 6)
  }
}

const trianglesFromMeshData = (mesh: MeshData): Triangle[] => {
  const point = (values: number[], index: number): Point3 => ({
    x: values[index * 3]!,
    y: values[index * 3 + 1]!,
    z: values[index * 3 + 2]!,
  })
  return Array.from({ length: mesh.indices.length / 3 }, (_, i) => ({
    vertices: mesh.indices
      .slice(i * 3, i * 3 + 3)
      .map((index) => point(mesh.positions, index)) as Triangle["vertices"],
    normal: point(mesh.normals, mesh.indices[i * 3]!),
  }))
}

const expectPoint = (actual: Point3, expected: Point3) => {
  expect(actual.x).toBeCloseTo(expected.x, 6)
  expect(actual.y).toBeCloseTo(expected.y, 6)
  expect(actual.z).toBeCloseTo(expected.z, 6)
}

const worldPoint = (box: Box3D, p: Point3): Point3 => ({
  x: p.x + box.center.x,
  y: p.y + box.center.y,
  z: p.z + box.center.z,
})

test("rigid folding preserves outward faces for mesh and primitive boxes", () => {
  for (const angle of [0, 37, 90, 180, 270])
    for (const bottom of [false, true])
      for (const moving of [false, true])
        for (const bendAngle of [90, -90, 180])
          for (const withMesh of [false, true]) {
            const box = makeBox(moving, bottom, angle)
            if (!withMesh) delete box.mesh
            const before = JSON.stringify(box)
            const folded = foldRigidBox(
              box,
              createPcbFold([{ ...bend, bend_angle: bendAngle }], 0.15),
              boardCenter,
              { x: box.center.x, y: box.center.z },
            )
            expectOutward(folded.mesh!)
            expect(folded.rotation).toBeUndefined()
            const exported = convertMeshToGLTFOrientation(
              createMeshFromSTL(folded.mesh!),
            )
            expectOutward({
              triangles: trianglesFromMeshData(exported),
              boundingBox: folded.mesh!.boundingBox,
            })
            expect(JSON.stringify(box)).toBe(before)
          }
})

test("empty folds preserve triangle metadata and UVs on the same off-axis vertices", () => {
  const box = makeBox(false, false, 0)
  box.rotation = undefined
  const before = JSON.stringify(box)
  const folded = foldRigidBox(box, createPcbFold([], 0.15), boardCenter)
  expectOutward(folded.mesh!)
  expectPoint(folded.center, box.center)
  for (const [index, triangle] of folded.mesh!.triangles.entries()) {
    const source = box.mesh!.triangles[index]!
    expect(triangle.uvs).toEqual(source.uvs)
    expect(triangle.color).toEqual(source.color)
    expect(triangle.materialIndex).toEqual(source.materialIndex)
    expect(triangle.pcbFace).toEqual(source.pcbFace)
    for (let corner = 0; corner < 3; corner++)
      expectPoint(triangle.vertices[corner]!, source.vertices[corner]!)
    expectPoint(triangle.normal, source.normal)
  }
  expect(JSON.stringify(box)).toBe(before)
})

test("UV markers follow measured stationary and quarter-circle moving planes on both layers", () => {
  const empty = createPcbFold([], 0.15)
  for (const angle of [0, 37, 90, 180, 270])
    for (const bottom of [false, true])
      for (const moving of [false, true])
        for (const bendAngle of [90, -90]) {
          const box = makeBox(moving, bottom, angle)
          const mount = { x: box.center.x, y: box.center.z }
          const flat = foldRigidBox(box, empty, boardCenter, mount)
          const folded = foldRigidBox(
            box,
            createPcbFold([{ ...bend, bend_angle: bendAngle }], 0.15),
            boardCenter,
            mount,
          )
          const flatVertices = new Map<string, Point3>()
          for (const triangle of flat.mesh!.triangles)
            triangle.vertices.forEach((p, corner) =>
              flatVertices.set(
                JSON.stringify(triangle.uvs![corner]),
                worldPoint(flat, p),
              ),
            )
          for (const triangle of folded.mesh!.triangles)
            triangle.vertices.forEach((p, corner) => {
              const original = flatVertices.get(
                JSON.stringify(triangle.uvs![corner]),
              )!
              // Beyond the quarter-circle, the moving plane lies at
              // x = 1 - pi/4 mm and rises with developed board X.
              const expected = !moving
                ? original
                : {
                    x:
                      boardCenter.x +
                      1 -
                      Math.PI / 4 -
                      Math.sign(bendAngle) * original.y,
                    y:
                      Math.sign(bendAngle) *
                      (original.x - boardCenter.x + 1 - Math.PI / 4),
                    z: original.z,
                  }
              expectPoint(worldPoint(folded, p), expected)
            })
        }
})

test("cardinal rotations place UV-marked off-axis vertices on the expected side of the mount", () => {
  const rotations = [
    { angle: 0, turn: (p: Point3) => ({ x: p.x, z: p.z }) },
    { angle: 90, turn: (p: Point3) => ({ x: -p.z, z: p.x }) },
    { angle: 180, turn: (p: Point3) => ({ x: -p.x, z: -p.z }) },
    { angle: 270, turn: (p: Point3) => ({ x: p.z, z: -p.x }) },
  ]
  for (const { angle, turn } of rotations)
    for (const bottom of [false, true]) {
      const box = makeBox(false, bottom, angle)
      const folded = foldRigidBox(box, createPcbFold([], 0.15), boardCenter)
      const layerSign = bottom ? -1 : 1
      for (const [index, triangle] of folded.mesh!.triangles.entries()) {
        const source = box.mesh!.triangles[index]!
        for (let corner = 0; corner < 3; corner++) {
          const p = source.vertices[corner]!
          const rotated = turn(p)
          expectPoint(worldPoint(folded, triangle.vertices[corner]!), {
            x: box.center.x + rotated.x,
            y: box.center.y + layerSign * p.y,
            z: box.center.z + layerSign * rotated.z,
          })
          expect(triangle.uvs![corner]).toEqual(source.uvs![corner])
        }
      }
    }
})
