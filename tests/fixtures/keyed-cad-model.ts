import { parseGLB } from "../../lib/loaders/glb"
import type { Triangle } from "../../lib/types"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

export const KEYED_CAD_MODEL_URL = "tests/assets/keyed-cad-model.obj"
export const KEYED_CAD_MODEL_ORIGIN = { x: 0, y: 0, z: 0 }

export const isKeyTriangle = ({ color }: Triangle): boolean =>
  Array.isArray(color) && color[0] > color[1] * 2 && color[0] > color[2] * 2

/** Actual exported world triangles: glTF Y-up, mm. */
export const getKeyedModelTriangles = (glb: ArrayBuffer): Triangle[] =>
  parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY).triangles.filter(
    (triangle) =>
      isKeyTriangle(triangle) ||
      (Array.isArray(triangle.color) &&
        triangle.color[2] > triangle.color[0] * 2 &&
        triangle.color[2] > triangle.color[1] * 1.5),
  )
