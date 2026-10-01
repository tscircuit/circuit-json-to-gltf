import { expect, test } from "bun:test"
import { prepareBoardGeometry } from "../../lib/geometry"
import { geometryBoard, geometryCircuit } from "../fixtures/geometry-circuit"

test("board relationships and exclusions are authoritative, and ambiguous boards are rejected", async () => {
  const circuit = geometryCircuit()
  circuit.push({
    ...geometryBoard,
    pcb_board_id: "other",
    subcircuit_id: "other-sub",
  })
  expect(
    (await prepareBoardGeometry({ circuitJson: circuit, pcbBoardId: "other" }))
      .components,
  ).toEqual([])
  const cad = circuit.find((item) => item.type === "cad_component")!
  if (cad.type !== "cad_component") throw new Error("Missing CAD")
  circuit.push({
    ...cad,
    cad_component_id: "standalone",
    pcb_component_id: undefined,
  })
  expect(
    (
      await prepareBoardGeometry({
        circuitJson: circuit,
        pcbBoardId: "board",
      })
    ).components.map(({ cadComponentId }) => cadComponentId),
  ).toEqual(["cad"])
  expect(
    (
      await prepareBoardGeometry({
        circuitJson: circuit,
        pcbBoardId: "board",
        supplementalModelMetadata: { excludedCadComponentIds: ["cad"] },
      })
    ).components,
  ).toEqual([])
  const pcb = circuit.find((item) => item.type === "pcb_component")!
  if (pcb.type !== "pcb_component") throw new Error("Missing PCB")
  pcb.subcircuit_id = undefined
  await expect(
    prepareBoardGeometry({ circuitJson: circuit, pcbBoardId: "board" }),
  ).rejects.toThrow("ambiguous board ownership")
  await expect(
    prepareBoardGeometry({ circuitJson: circuit, pcbBoardId: "absent" }),
  ).rejects.toThrow("exactly one")
})
