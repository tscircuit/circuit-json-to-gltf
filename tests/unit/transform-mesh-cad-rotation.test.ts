import { expect, test } from "bun:test"
import { transformMesh, type MeshData } from "../../lib/gltf/geometry"

test("mesh points and normals follow right-handed intrinsic XYZ CAD rotations", () => {
  // Project-space results for the off-axis point (1, 2, 3), independently
  // calculated with Three.js Vector3.applyEuler(new Euler(x, y, z, "XYZ")).
  const cases = [
    { degrees: [0, 0, 0], expected: [1, 2, 3] },
    { degrees: [90, 0, 0], expected: [1, -3, 2] },
    { degrees: [180, 0, 0], expected: [1, -2, -3] },
    { degrees: [270, 0, 0], expected: [1, 3, -2] },
    { degrees: [0, 90, 0], expected: [3, 2, -1] },
    { degrees: [0, 180, 0], expected: [-1, 2, -3] },
    { degrees: [0, 270, 0], expected: [-3, 2, 1] },
    { degrees: [0, 0, 90], expected: [-2, 1, 3] },
    { degrees: [0, 0, 180], expected: [-1, -2, 3] },
    { degrees: [0, 0, 270], expected: [2, -1, 3] },
    {
      degrees: [37, 0, 0],
      expected: [1, -0.20817404936155937, 3.5995365764459755],
    },
    {
      degrees: [0, 30, 0],
      expected: [2.366025403784439, 2, 2.098076211353316],
    },
    {
      degrees: [0, 0, 47],
      expected: [-0.7807090431758423, 2.0953504217441674, 3],
    },
    {
      degrees: [23, 31, 47],
      expected: [0.8759159615573968, 0.766903405514455, 3.5559289074585436],
    },
    {
      degrees: [-23, -31, -47],
      expected: [0.29325742519868137, 2.0187204171937045, 3.1366810420843105],
    },
  ] as const
  const length = Math.sqrt(14)
  const mesh: MeshData = {
    positions: [1, 2, 3],
    normals: [1 / length, 2 / length, 3 / length],
    texcoords: [0.25, 0.75],
    indices: [0],
    colors: [1, 0, 0, 1],
  }
  const original = structuredClone(mesh)
  for (const {
    degrees: [x, y, z],
    expected,
  } of cases) {
    const rotation = {
      x: (x * Math.PI) / 180,
      y: (y * Math.PI) / 180,
      z: (z * Math.PI) / 180,
    }
    for (const scale of [1, 2]) {
      const result = transformMesh(mesh, { x: 7, y: -5, z: 11 }, rotation, {
        x: scale,
        y: scale,
        z: scale,
      })
      for (let axis = 0; axis < 3; axis++) {
        expect(result.positions[axis]).toBeCloseTo(
          expected[axis]! * scale + [7, -5, 11][axis]!,
          10,
        )
        expect(result.normals[axis]).toBeCloseTo(expected[axis]! / length, 10)
      }
      expect(Math.hypot(...result.normals)).toBeCloseTo(1, 10)
      expect(result.texcoords).toEqual(mesh.texcoords)
      expect(result.indices).toEqual(mesh.indices)
      expect(result.colors).toEqual(mesh.colors)
    }
  }
  expect(mesh).toEqual(original)
})
