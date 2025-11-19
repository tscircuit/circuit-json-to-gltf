import { rotateX } from "@jscad/modeling/src/operations/transforms"
import { subtract } from "@jscad/modeling/src/operations/booleans"
import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import measureBoundingBox from "@jscad/modeling/src/measurements/measureBoundingBox"
import type { PcbHole, PCBPlatedHole, PcbPanel } from "circuit-json"
import type { BoundingBox, STLMesh } from "../types"
import { createBoundingBox, geom3ToTriangles } from "./pcb-board-geometry"
import { createBoardOutlineGeom, createHoleGeoms } from "./pcb-board-geometry"
import type { BoardGeometryOptions } from "./pcb-board-geometry"

export const createPanelMesh = (
  panel: PcbPanel,
  options: BoardGeometryOptions,
): STLMesh => {
  // Panels are solid rectangles with no cutouts
  const { thickness, holes = [], platedHoles = [] } = options
  const center = panel.center ?? { x: 0, y: 0 }

  let panelGeom = createBoardOutlineGeom(panel, center, thickness)

  // Panels may have holes for mounting, but never have cutouts
  const holeGeoms = createHoleGeoms(center, thickness, holes, platedHoles)
  if (holeGeoms.length > 0) {
    panelGeom = subtract(panelGeom, ...holeGeoms)
  }

  panelGeom = rotateX(-Math.PI / 2, panelGeom)

  const polygons = geom3.toPolygons(panelGeom)
  const triangles = geom3ToTriangles(panelGeom, polygons)

  const bboxValues = measureBoundingBox(panelGeom)
  const boundingBox = createBoundingBox(bboxValues)

  return {
    triangles,
    boundingBox,
  }
}
