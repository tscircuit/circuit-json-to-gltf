import { rotateX } from "@jscad/modeling/src/operations/transforms"
import { subtract } from "@jscad/modeling/src/operations/booleans"
import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import measureBoundingBox from "@jscad/modeling/src/measurements/measureBoundingBox"
import type { PcbHole, PCBPlatedHole, PcbPanel } from "circuit-json"
import type { BoundingBox, STLMesh } from "../types"
import { createBoundingBox, geom3ToTriangles } from "./pcb-board-geometry"
import { createBoardOutlineGeom, createHoleGeoms } from "./pcb-board-geometry"
import { createCutoutGeoms } from "./pcb-board-cutouts"
import type { BoardGeometryOptions } from "./pcb-board-geometry"

export const createPanelMesh = (
  panel: PcbPanel,
  options: BoardGeometryOptions,
): STLMesh => {
  const { thickness, holes = [], platedHoles = [], cutouts = [] } = options
  const center = panel.center ?? { x: 0, y: 0 }

  let panelGeom = createBoardOutlineGeom(panel, center, thickness)

  // Create geometries for holes and cutouts
  const holeGeoms = createHoleGeoms(center, thickness, holes, platedHoles)
  const cutoutGeoms = createCutoutGeoms(center, thickness, cutouts)
  const subtractGeoms = [...holeGeoms, ...cutoutGeoms]
  if (subtractGeoms.length > 0) {
    panelGeom = subtract(panelGeom, ...subtractGeoms)
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
