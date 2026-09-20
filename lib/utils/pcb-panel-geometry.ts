import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import measureBoundingBox from "@jscad/modeling/src/measurements/measureBoundingBox"
import { subtract } from "@jscad/modeling/src/operations/booleans"
import { mirrorY } from "@jscad/modeling/src/operations/transforms"
import type { PCBPlatedHole, PcbHole, PcbPanel } from "circuit-json"
import type { BoundingBox, STLMesh } from "../types"
import { batchedUnion } from "./batched-union"
import {
  createCutoutGeoms,
  DEFAULT_QUALITY_MODE_SEGMENTS,
  HIGH_QUALITY_MODE_SEGMENTS,
  HIGH_QUALITY_MODE_REDUCED_SEGMENTS,
  HOLE_COUNT_THRESHOLD,
  REDUCED_QUALITY_MODE_SEGMENTS,
} from "./pcb-board-cutouts"
import type { BoardGeometryOptions } from "./pcb-board-geometry"
import {
  createBoardOutlineGeom,
  createBoundingBox,
  createHoleGeoms,
  geom3ToTriangles,
} from "./pcb-board-geometry"

/** Right-handed Circuit JSON local XYZ in mm; panel.center remains separate. */
export const createPanelMesh = (
  panel: PcbPanel,
  options: BoardGeometryOptions,
): STLMesh => {
  const { thickness, holes = [], platedHoles = [], cutouts = [] } = options
  const drillQuality = options.drillQuality ?? "fast"
  const center = panel.center ?? { x: 0, y: 0 }

  let panelGeom = createBoardOutlineGeom(panel, center, thickness)

  const totalHoleCount = holes.length + platedHoles.length
  const segments =
    drillQuality === "high"
      ? totalHoleCount > HOLE_COUNT_THRESHOLD
        ? HIGH_QUALITY_MODE_REDUCED_SEGMENTS
        : HIGH_QUALITY_MODE_SEGMENTS
      : totalHoleCount > HOLE_COUNT_THRESHOLD
        ? REDUCED_QUALITY_MODE_SEGMENTS
        : DEFAULT_QUALITY_MODE_SEGMENTS

  // Create geometries for holes and cutouts
  const holeGeoms = createHoleGeoms(
    center,
    thickness,
    holes,
    platedHoles,
    segments,
  )
  // Cutout solids still use (local X, -local Y, local Z).
  // JSCAD's mirror also reverses polygon winding to keep outward normals.
  const cutoutGeoms = createCutoutGeoms(
    center,
    thickness,
    cutouts,
    segments,
  ).map((geometry) => mirrorY(geometry))
  const subtractGeoms = [...holeGeoms, ...cutoutGeoms]
  if (subtractGeoms.length > 0) {
    const unifiedHoles = batchedUnion(subtractGeoms)
    panelGeom = subtract(panelGeom, unifiedHoles)
  }

  const polygons = geom3.toPolygons(panelGeom)
  const triangles = geom3ToTriangles(panelGeom, polygons)

  const bboxValues = measureBoundingBox(panelGeom)
  const boundingBox = createBoundingBox(bboxValues)

  return {
    triangles,
    boundingBox,
  }
}
