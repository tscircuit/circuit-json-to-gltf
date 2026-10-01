import { expect, test } from "bun:test"
import { resolveGeometryBoardId } from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("single-board fallback does not assign explicitly unrelated components to the board", () => {
  const circuitJson = geometryCircuit()
  const pcb = circuitJson.find((item) => item.type === "pcb_component")
  if (pcb?.type !== "pcb_component") throw new Error("Missing PCB")
  pcb.subcircuit_id = "off-board-sub"
  expect(resolveGeometryBoardId(circuitJson, pcb)).toBeUndefined()
  expect(
    resolveGeometryBoardId(circuitJson, { pcb_component_id: "pcb" }),
  ).toBeUndefined()
  pcb.subcircuit_id = undefined
  expect(resolveGeometryBoardId(circuitJson, pcb)).toBe("board")
  expect(
    resolveGeometryBoardId(circuitJson, { pcb_component_id: "missing" }),
  ).toBeUndefined()
})
