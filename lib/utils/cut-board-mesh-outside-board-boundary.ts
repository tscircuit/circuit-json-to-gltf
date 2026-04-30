import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import measureBoundingBox from "@jscad/modeling/src/measurements/measureBoundingBox"
import { subtract } from "@jscad/modeling/src/operations/booleans"
import { rotateX } from "@jscad/modeling/src/operations/transforms"
import type { PcbBoard, PcbHole, PcbPanel, PcbPlatedHole } from "circuit-json"
import type { STLMesh } from "../types"
import { batchedUnion } from "./batched-union"
import type { BoardCutout } from "./pcb-board-cutouts"
import { createCutoutGeoms } from "./pcb-board-cutouts"
import {
  createBoardOutlineGeom,
  createBoundingBox,
  createHoleGeoms,
  geom3ToTriangles,
} from "./pcb-board-geometry"

export const cutBoardMeshOutsideBoardBoundary = ({
  board,
  center,
  thickness,
  holes,
  platedHoles,
  cutouts,
  segments,
}: {
  board: PcbPanel | PcbBoard
  center: { x: number; y: number }
  thickness: number
  holes: PcbHole[]
  platedHoles: PcbPlatedHole[]
  cutouts: BoardCutout[]
  segments: number
}): STLMesh => {
  let boardGeom = createBoardOutlineGeom(board, center, thickness)
  const subtractGeoms = [
    ...createHoleGeoms(center, thickness, holes, platedHoles, segments),
    ...createCutoutGeoms(center, thickness, cutouts, segments),
  ]

  if (subtractGeoms.length > 0) {
    boardGeom = subtract(boardGeom, batchedUnion(subtractGeoms))
  }

  boardGeom = rotateX(-Math.PI / 2, boardGeom)

  const polygons = geom3.toPolygons(boardGeom)
  return {
    triangles: geom3ToTriangles(boardGeom, polygons),
    boundingBox: createBoundingBox(measureBoundingBox(boardGeom)),
  }
}
