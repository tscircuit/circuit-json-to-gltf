import type { CircuitJson, PcbPanel, PcbBoard } from "circuit-json"
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
