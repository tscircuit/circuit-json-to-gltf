import { expect, test } from "bun:test"
import {
  prepareBoardGeometry,
  resolveGeometryBoardId,
} from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("core source-board relationships resolve ownership without redundant PCB board subcircuit metadata", async () => {
  const circuitJson = geometryCircuit()
  const board = circuitJson.find((item) => item.type === "pcb_board")
  if (board?.type !== "pcb_board") throw new Error("Missing board")
  board.subcircuit_id = undefined
  Object.assign(board, { source_board_id: "source-board" })
  circuitJson.push(
    {
      type: "source_board",
      source_board_id: "source-board",
      source_group_id: "source-group",
    },
    {
      type: "source_group",
      source_group_id: "source-group",
      subcircuit_id: "board-sub",
      is_subcircuit: true,
    },
    {
      type: "pcb_hole",
      pcb_hole_id: "hole",
      x: 0,
      y: 0,
      hole_shape: "circle",
      hole_diameter: 2,
      subcircuit_id: "board-sub",
    },
  )
  expect(resolveGeometryBoardId(circuitJson, { pcb_component_id: "pcb" })).toBe(
    "board",
  )
  const prepared = await prepareBoardGeometry({
    circuitJson,
    pcbBoardId: "board",
  })
  expect(prepared.components[0]?.status).toBe("available")
  expect(prepared.board.mesh.triangles.length).toBeGreaterThan(12)
  board.subcircuit_id = "contradictory"
  expect(() =>
    resolveGeometryBoardId(circuitJson, { pcb_component_id: "pcb" }),
  ).toThrow("Conflicting board subcircuit ownership")
})
