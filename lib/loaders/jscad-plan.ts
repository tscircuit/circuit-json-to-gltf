import * as jscadModeling from "@jscad/modeling"
import measureEpsilon from "@jscad/modeling/src/measurements/measureEpsilon"
import { conformJscadTriangles } from "./conform-jscad-triangles"
import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import type { Geom3 } from "@jscad/modeling/src/geometries/types"
import { EPS, NEPS } from "@jscad/modeling/src/maths/constants"
import { executeJscadOperations } from "jscad-planner"
import type { STLMesh } from "../types"
import { boundsOfTriangles } from "../utils/bounding-box"
import {
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "../utils/coordinate-transform"
import { geom3ToTriangles } from "../utils/pcb-board-geometry"

const JSCAD_PLAN_TRANSFORM = COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP

export const loadJscadPlan = (
  plan: unknown,
  { conformingTriangles = false } = {},
): STLMesh => {
  const plannedGeometry = executeJscadOperations(
    jscadModeling as any,
    plan as any,
  ) as Geom3
  // Triangulate the original polygons. generalize() snaps both surface vertices
  // and new polygon centers, which can move independently loaded contact faces.
  const polygons = geom3.toPolygons(plannedGeometry)
  const sourceTriangles = geom3ToTriangles(plannedGeometry, polygons)
  // Only numerical collinearity is relevant without snapping. Scale JSCAD's
  // double-precision NEPS by the same geometry extent used by measureEpsilon.
  const collinearityEpsilon =
    NEPS * Math.max(1, measureEpsilon(plannedGeometry) / EPS)
  const triangles = transformTriangles(
    conformingTriangles
      ? conformJscadTriangles(sourceTriangles, collinearityEpsilon)
      : sourceTriangles,
    JSCAD_PLAN_TRANSFORM,
  )

  // Bounds come from the triangles this mesh ships, not from measuring the
  // source Geom3: the geometry stays Z-up and only the triangles are remapped,
  // so the source box describes a different frame, and moving that box into
  // this one is only exact while the transform keeps axes aligned. Scanning the
  // triangles is exact for any transform and costs one pass over vertices we
  // have just built anyway -- the same thing the STL/OBJ/GLB/STEP loaders do.
  return {
    triangles,
    boundingBox: boundsOfTriangles(triangles),
  }
}
