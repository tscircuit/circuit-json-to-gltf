import { expect, test } from "bun:test"
import * as jscad from "@jscad/modeling"
import { getJscadModelForFootprint } from "jscad-electronics/vanilla"
import type { Point3 } from "../../lib/types"
import {
  boundsOfPositions,
  boundsOfTriangles,
} from "../../lib/utils/bounding-box"
import {
  exportFootprinter,
  footprinterCircuit,
  footprinterRotationCases,
} from "../fixtures/footprinter-xyz"

test.each([
  ...footprinterRotationCases,
  { name: "x90", rotation: { x: 90, y: 0, z: 0 } },
  { name: "y90", rotation: { x: 0, y: 90, z: 0 } },
  { name: "x270", rotation: { x: 270, y: 0, z: 0 } },
  { name: "y270", rotation: { x: 0, y: 270, z: 0 } },
])(
  "exported ordinary footprinter follows intrinsic XYZ: $name",
  async ({ rotation }) => {
    // Circuit JSON is right-handed, Z-up. Like 3d-viewer's FootprinterModel
    // Three.Group default XYZ Euler, intrinsic XYZ is Rx * Ry * Rz: apply Z,
    // then Y, then X to native points. Single-axis cases also independently
    // pin the right-hand sign, irrespective of Euler-order terminology.
    const native = getJscadModelForFootprint("soic8", jscad)
    const { rotateX, rotateY, rotateZ } = jscad.transforms
    const rad = Math.PI / 180
    const { mesh } = await exportFootprinter(footprinterCircuit(rotation))

    for (const color of ["#fff", "#555"]) {
      const expected: Point3[] = native.geometries
        .filter((entry) => entry.color === color)
        .flatMap(({ geom }) =>
          jscad.geometries.geom3
            .toPolygons(
              rotateX(
                rotation.x * rad,
                rotateY(rotation.y * rad, rotateZ(rotation.z * rad, geom)),
              ),
            )
            .flatMap((polygon) =>
              polygon.vertices.map(([x, y, z]) => ({
                x: -(x + 7),
                y: z + 3,
                z: y - 4,
              })),
            ),
        )
      const triangles = mesh.triangles.filter(
        (triangle) =>
          Array.isArray(triangle.color) &&
          (color === "#fff"
            ? triangle.color[0] > 200
            : triangle.color[0] < 150),
      )
      const actual = triangles.flatMap((triangle) => triangle.vertices)
      expect(expected.length).toBeGreaterThan(0)
      expect(actual.length).toBeGreaterThan(0)
      const expectedBounds = boundsOfPositions(
        expected.flatMap((p) => [p.x, p.y, p.z]),
      )
      const actualBounds = boundsOfTriangles(triangles)
      for (const end of ["min", "max"] as const) {
        for (const axis of ["x", "y", "z"] as const) {
          expect(actualBounds[end][axis]).toBeCloseTo(
            expectedBounds[end][axis],
            4,
          )
        }
      }
      // Bounds alone can hide reflected pins. Compare both point clouds,
      // allowing only float32 GLB quantization, not geometric differences.
      for (const [from, to] of [
        [expected, actual],
        [actual, expected],
      ]) {
        let maxDistanceSquared = 0
        for (const p of from!) {
          let nearest = Infinity
          for (const q of to!) {
            nearest = Math.min(
              nearest,
              (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2,
            )
            if (nearest < 1e-12) break
          }
          maxDistanceSquared = Math.max(maxDistanceSquared, nearest)
        }
        expect(Math.sqrt(maxDistanceSquared)).toBeLessThan(0.00002)
      }
    }
  },
)
