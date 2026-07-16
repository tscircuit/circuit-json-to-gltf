import * as jscadModeling from "@jscad/modeling"
import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import type { Geom3 } from "@jscad/modeling/src/geometries/types"
import measureBoundingBox from "@jscad/modeling/src/measurements/measureBoundingBox"
import { rotateX } from "@jscad/modeling/src/operations/transforms"
import { executeJscadOperations } from "jscad-planner"
import type { STLMesh } from "../types"
import {
  createBoundingBox,
  geom3ToTriangles,
} from "../utils/pcb-board-geometry"

export const loadJscadPlan = (plan: unknown): STLMesh => {
  const zUpGeometry = executeJscadOperations(
    jscadModeling as any,
    plan as any,
  ) as Geom3
  const yUpGeometry = rotateX(-Math.PI / 2, zUpGeometry)
  const polygons = geom3.toPolygons(yUpGeometry)

  return {
    triangles: geom3ToTriangles(yUpGeometry, polygons),
    boundingBox: createBoundingBox(measureBoundingBox(yUpGeometry)),
  }
}
