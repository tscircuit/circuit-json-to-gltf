import * as jscadModeling from "@jscad/modeling"
import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import type { Geom3 } from "@jscad/modeling/src/geometries/types"
import { executeJscadOperations, type MaterialProps } from "jscad-planner"
import type { STLMesh } from "../types"
import { boundsOfTriangles } from "../utils/bounding-box"
import {
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "../utils/coordinate-transform"
import { geom3ToTriangles } from "../utils/pcb-board-geometry"

const JSCAD_PLAN_TRANSFORM = COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP

export const loadJscadPlan = (plan: unknown): STLMesh => {
  // A JSX root can contain several independent shapes. Execute each plan
  // separately so combining them does not discard their individual materials.
  const plans = Array.isArray(plan) ? plan.flat(Infinity) : [plan]
  const zUpGeometry = plans.map((operation) =>
    executeJscadOperations(jscadModeling as any, operation as any),
  ) as ((Geom3 & MaterialProps) | (Geom3 & MaterialProps)[])[]
  const geometries = zUpGeometry.flat(Infinity) as (Geom3 & MaterialProps)[]
  const sourceTriangles = geometries.flatMap((geometry) => {
    const polygons = geom3.toPolygons(geometry)
    return polygons.flatMap((polygon) => {
      const color = polygon.color ?? geometry.color
      const material =
        geometry.material || color
          ? {
              ...(color
                ? {
                    color: color.slice(0, 3) as [number, number, number],
                    opacity: color[3] ?? 1,
                  }
                : {}),
              ...geometry.material,
            }
          : undefined
      return geom3ToTriangles(geometry, [polygon]).map((triangle) => ({
        ...triangle,
        material,
      }))
    })
  })
  const triangles = transformTriangles(sourceTriangles, JSCAD_PLAN_TRANSFORM)

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
