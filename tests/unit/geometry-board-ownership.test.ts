import { expect, test } from "bun:test"
import { resolveGeometryBoardId } from "../../lib/geometry"
import { geometryBoard, geometryCircuit } from "../fixtures/geometry-circuit"

test("public ownership resolution selects PCB owners without CAD through subcircuit ancestry", () => {
  const circuitJson = geometryCircuit().filter(
    (item) => item.type !== "cad_component",
  )
  circuitJson.push(
    { ...geometryBoard, pcb_board_id: "other", subcircuit_id: "other-sub" },
    {
      type: "source_group",
      source_group_id: "child-group",
      subcircuit_id: "child-sub",
      parent_subcircuit_id: "board-sub",
      is_subcircuit: true,
    },
  )
  const pcb = circuitJson.find((item) => item.type === "pcb_component")
  if (pcb?.type !== "pcb_component") throw new Error("Missing PCB")
  pcb.subcircuit_id = "child-sub"
  expect(resolveGeometryBoardId(circuitJson, pcb)).toBe("board")
  expect(
    resolveGeometryBoardId(circuitJson, {
      pcb_component_id: pcb.pcb_component_id,
    }),
  ).toBe("board")
  expect(resolveGeometryBoardId(circuitJson, {})).toBeUndefined()
  expect(resolveGeometryBoardId(circuitJson, { pcb_board_id: "other" })).toBe(
    "other",
  )
})
