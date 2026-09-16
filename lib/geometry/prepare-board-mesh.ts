import type { CircuitJson, PcbBoard } from "circuit-json"
import {
  createBoardMesh,
  type BoardGeometryOptions,
} from "../utils/pcb-board-geometry"
import { filterCutoutsForBoard } from "../utils/pcb-board-cutouts"
import { resolveGeometryBoardId } from "./board-ownership"

/** Board-centered intermediate Y-up mesh, shared with the scene exporter. */
export function prepareBoardMesh(
  circuitJson: CircuitJson,
  board: PcbBoard,
  options: Pick<BoardGeometryOptions, "thickness" | "drillQuality">,
) {
  const belongsToBoard = (item: {
    pcb_board_id?: string
    pcb_component_id?: string
  }) => {
    const ownerId = resolveGeometryBoardId(circuitJson, item)
    if (ownerId === undefined)
      throw new Error("Ambiguous board ownership for drilled geometry")
    return ownerId === board.pcb_board_id
  }
  return createBoardMesh(board, {
    ...options,
    holes: circuitJson
      .filter((item) => item.type === "pcb_hole")
      .filter(belongsToBoard),
    platedHoles: circuitJson
      .filter((item) => item.type === "pcb_plated_hole")
      .filter(belongsToBoard),
    cutouts: filterCutoutsForBoard(
      circuitJson
        .filter((item) => item.type === "pcb_cutout")
        .filter(belongsToBoard),
      board,
    ),
  })
}
