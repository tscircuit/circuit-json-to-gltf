import type { CircuitJson, PcbBoard } from "circuit-json"

function boardSubcircuitId(circuitJson: CircuitJson, board: PcbBoard) {
  let sourceSubcircuitId: string | undefined
  // Core serializes this link before every schema version exposes it in PcbBoard.
  if ("source_board_id" in board && board.source_board_id !== undefined) {
    if (typeof board.source_board_id !== "string")
      throw new Error(`Invalid source board reference on ${board.pcb_board_id}`)
    const sourceBoards = circuitJson.filter(
      (item) =>
        item.type === "source_board" &&
        item.source_board_id === board.source_board_id,
    )
    if (sourceBoards.length !== 1)
      throw new Error(
        `Unresolved source board ownership for ${board.pcb_board_id}`,
      )
    const sourceBoard = sourceBoards[0]!
    if (sourceBoard.type !== "source_board")
      throw new Error("Invalid source board record")
    const groups = circuitJson.filter(
      (item) =>
        item.type === "source_group" &&
        item.source_group_id === sourceBoard.source_group_id,
    )
    if (groups.length !== 1)
      throw new Error(
        `Unresolved source group ownership for ${board.pcb_board_id}`,
      )
    const group = groups[0]!
    if (group.type === "source_group") sourceSubcircuitId = group.subcircuit_id
  }
  if (
    board.subcircuit_id !== undefined &&
    sourceSubcircuitId !== undefined &&
    board.subcircuit_id !== sourceSubcircuitId
  )
    throw new Error(
      `Conflicting board subcircuit ownership for ${board.pcb_board_id}`,
    )
  return board.subcircuit_id ?? sourceSubcircuitId
}

/** Resolve serialized ownership, never physical proximity. */
export function resolveGeometryBoardId(
  circuitJson: CircuitJson,
  element: {
    subcircuit_id?: string
    pcb_component_id?: string
    pcb_group_id?: string
    pcb_board_id?: string
  },
): string | undefined {
  if (element.pcb_board_id !== undefined) return element.pcb_board_id
  let subcircuitId = element.subcircuit_id
  let pcbGroupId = element.pcb_group_id
  if (subcircuitId === undefined && element.pcb_component_id !== undefined) {
    const owner = circuitJson.find(
      (item) =>
        item.type === "pcb_component" &&
        item.pcb_component_id === element.pcb_component_id,
    )
    if (owner?.type !== "pcb_component") return undefined
    subcircuitId = owner.subcircuit_id
    pcbGroupId ??= owner.pcb_group_id
  }
  if (subcircuitId === undefined && pcbGroupId !== undefined) {
    const group = circuitJson.find(
      (item) => item.type === "pcb_group" && item.pcb_group_id === pcbGroupId,
    )
    if (group?.type !== "pcb_group") return undefined
    subcircuitId = group.subcircuit_id
  }
  const boards = circuitJson
    .filter((item) => item.type === "pcb_board")
    .map((board) => ({
      id: board.pcb_board_id,
      subcircuitId: boardSubcircuitId(circuitJson, board),
    }))
  const visited = new Set<string>()
  while (subcircuitId !== undefined) {
    if (visited.has(subcircuitId))
      throw new Error(`Cyclic subcircuit ownership at ${subcircuitId}`)
    visited.add(subcircuitId)
    const candidates = boards.filter(
      (board) => board.subcircuitId === subcircuitId,
    )
    if (candidates.length > 1)
      throw new Error(`Multiple boards own subcircuit ${subcircuitId}`)
    const board = candidates[0]
    if (board) return board.id
    const groups = circuitJson.filter(
      (item) =>
        item.type === "source_group" &&
        item.subcircuit_id === subcircuitId &&
        item.parent_subcircuit_id !== undefined,
    )
    const parents = new Set(
      groups.map((group) =>
        group.type === "source_group" ? group.parent_subcircuit_id : undefined,
      ),
    )
    if (parents.size > 1)
      throw new Error(
        `Conflicting parent ownership for subcircuit ${subcircuitId}`,
      )
    subcircuitId = parents.values().next().value
  }
  if (visited.size > 0) return undefined
  return boards.length === 1 ? boards[0]!.id : undefined
}
