import * as mat4 from "@jscad/modeling/src/maths/mat4"
import type { Point3 } from "../types"

/**
 * Right-handed intrinsic XYZ rotation in canonical Z-up space, in radians.
 * Matches 3d-viewer/src/utils/cad-model-transform.ts:getBaseCadRotation and
 * Three.js Euler's XYZ default: Rx * Ry * Rz (points experience Z, Y, X).
 */
export function getCadRotationMatrix(rotation: Point3) {
  return mat4.multiply(
    mat4.create(),
    mat4.multiply(
      mat4.create(),
      mat4.fromXRotation(mat4.create(), rotation.x),
      mat4.fromYRotation(mat4.create(), rotation.y),
    ),
    mat4.fromZRotation(mat4.create(), rotation.z),
  )
}
