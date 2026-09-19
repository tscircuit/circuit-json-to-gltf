import * as jscadModeling from "@jscad/modeling"
import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import type { Geom3 } from "@jscad/modeling/src/geometries/types"
import { executeJscadOperations } from "jscad-planner"
import type { CoordinateTransformConfig, STLMesh } from "../types"
import { boundsOfTriangles } from "../utils/bounding-box"
import {
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "../utils/coordinate-transform"
import { geom3ToTriangles } from "../utils/pcb-board-geometry"

/** JSCAD plans already use canonical right-handed Z-up local coordinates. */
export const loadJscadPlan = (
  plan: unknown,
  transform: CoordinateTransformConfig = COORDINATE_TRANSFORMS.IDENTITY,
): STLMesh => {
  const zUpGeometry = executeJscadOperations(
    jscadModeling as any,
    plan as any,
  ) as Geom3
  const polygons = geom3.toPolygons(zUpGeometry)
  const sourceTriangles = geom3ToTriangles(zUpGeometry, polygons)
  const triangles = transformTriangles(sourceTriangles, transform)

  return {
    triangles,
    boundingBox: boundsOfTriangles(triangles),
  }
}
