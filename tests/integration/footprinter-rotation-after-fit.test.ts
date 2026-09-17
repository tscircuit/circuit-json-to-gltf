import { expect, test } from "bun:test"
import { maths } from "@jscad/modeling"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import type { Point3 } from "../../lib/types"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { getBoundingBoxSize } from "../../lib/utils/mesh-scale"
import {
  exportFootprinter,
  footprinterCircuit,
} from "../fixtures/footprinter-xyz"

test.each(["fill_bounds" as const, "contain_within_bounds" as const])(
  "SOIC14 occurrence rotation follows origin/units/%s without changing cached geometry",
  async (fit) => {
    const rotation = { x: 23, y: 31, z: 47 }
    const overrides = {
      footprinter_string: "soic14",
      position: { x: 7, y: -4, z: 3 },
      model_origin_position: { x: 0.3, y: -0.7, z: 0.2 },
      model_unit_to_mm_scale_factor: 2,
      size: { x: 9, y: 8, z: 4 },
      model_object_fit: fit,
    }
    const circuit = footprinterCircuit(rotation, overrides)
    const unrotatedCircuit = footprinterCircuit({ x: 0, y: 0, z: 0 }, overrides)
    const unrotated = await exportFootprinter(unrotatedCircuit)
    const rotated = await exportFootprinter(circuit)
    const { vec3 } = maths

    // Independent vector primitives in Circuit Z-up, not the production
    // change-of-basis matrix. Rotate about the CAD anchor, never the fit center.
    const expected = (point: Point3, isNormal = false): Point3 => {
      const anchor = isNormal ? { x: 0, y: 0, z: 0 } : overrides.position
      const v = vec3.fromValues(
        -point.x - anchor.x,
        point.z - anchor.y,
        point.y - anchor.z,
      )
      const origin = vec3.create()
      vec3.rotateZ(v, v, origin, (rotation.z * Math.PI) / 180)
      vec3.rotateY(v, v, origin, (rotation.y * Math.PI) / 180)
      vec3.rotateX(v, v, origin, (rotation.x * Math.PI) / 180)
      return { x: -(v[0] + anchor.x), y: v[2] + anchor.z, z: v[1] + anchor.y }
    }
    expect(rotated.mesh.triangles.length).toBe(unrotated.mesh.triangles.length)
    for (const [index, triangle] of unrotated.mesh.triangles.entries()) {
      const actual = rotated.mesh.triangles[index]!
      const expectedPoints = [
        ...triangle.vertices.map((p) => expected(p)),
        expected(triangle.normal, true),
      ]
      const actualPoints = [...actual.vertices, actual.normal]
      for (const [i, p] of expectedPoints.entries()) {
        for (const axis of ["x", "y", "z"] as const) {
          expect(actualPoints[i]![axis]).toBeCloseTo(p[axis], 4)
        }
      }
    }
    const scene = await convertCircuitJsonTo3D(circuit, {
      renderBoardTextures: false,
    })
    const box = scene.boxes[0]!
    expect(box.rotation).toBeUndefined()
    expect(box.center).toEqual({ x: 7, y: 3, z: -4 })
    expect(box.mesh!.boundingBox).toEqual(
      boundsOfTriangles(box.mesh!.triangles),
    )
    expect(box.size).toEqual(getBoundingBoxSize(box.mesh!.boundingBox))
    expect((await exportFootprinter(unrotatedCircuit)).mesh).toEqual(
      unrotated.mesh,
    )
  },
)
