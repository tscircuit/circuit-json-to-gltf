import type { CircuitJson, PcbPanel, PcbBoard } from "circuit-json"
import type { PcbCutout } from "circuit-json"
import { cju } from "@tscircuit/circuit-json-util"

/**
 * Get the primary surface for rendering (panel takes priority over board)
 */
export function getPrimarySurface(
  circuitJson: CircuitJson,
): PcbPanel | PcbBoard | undefined {
  const db: any = cju(circuitJson)
  return (
    (db.pcb_panel?.list?.()[0] as PcbPanel | undefined) ||
    (db.pcb_board?.list?.()[0] as PcbBoard | undefined)
  )
}

export function filterCutoutsForBoard(
  cutouts: PcbCutout[],
  board: PcbBoard,
): PcbCutout[] {
  return cutouts.filter((cutout) => {
    return !cutout.pcb_board_id || cutout.pcb_board_id === board.pcb_board_id
  })
}
