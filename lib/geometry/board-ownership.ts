import type { CircuitJson } from "circuit-json"

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
  const visited = new Set<string>()
  while (subcircuitId !== undefined) {
    if (visited.has(subcircuitId))
      throw new Error(`Cyclic subcircuit ownership at ${subcircuitId}`)
    visited.add(subcircuitId)
    const boards = circuitJson.filter(
      (item) =>
        item.type === "pcb_board" && item.subcircuit_id === subcircuitId,
    )
    if (boards.length > 1)
      throw new Error(`Multiple boards own subcircuit ${subcircuitId}`)
    const board = boards[0]
    if (board?.type === "pcb_board") return board.pcb_board_id
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
  const boards = circuitJson.filter((item) => item.type === "pcb_board")
  return boards.length === 1 ? boards[0]!.pcb_board_id : undefined
}
