import { maths } from "@jscad/modeling"
import type { Point3 } from "../../lib/types"
import type { HandAxis } from "./right-hand-model"

/**
 * Signed displacement of an off-axis point about the positive Circuit JSON
 * axis through (0,0,0), in degrees. Inputs are measured world positions in mm,
 * after undoing only the final glTF frame mapping, never the CAD rotation.
 */
export function measureGripRotation(
  axis: HandAxis,
  initial: Point3,
  final: Point3,
) {
  const { vec3 } = maths
  const normal: [number, number, number] = [0, 0, 0]
  normal[{ x: 0, y: 1, z: 2 }[axis]] = 1
  const project = (point: Point3) => {
    const vector: [number, number, number] = [point.x, point.y, point.z]
    const projected = vec3.subtract(
      vec3.create(),
      vector,
      vec3.scale(vec3.create(), normal, vec3.dot(normal, vector)),
    )
    if (vec3.length(projected) < 1e-8) {
      throw new Error("Grip fiducial must be off the rotation axis")
    }
    return projected
  }
  const from = project(initial)
  const to = project(final)
  return (
    (Math.atan2(
      vec3.dot(normal, vec3.cross(vec3.create(), from, to)),
      vec3.dot(from, to),
    ) *
      180) /
    Math.PI
  )
}
