import { expect, test } from "bun:test"
import { getBoardColorPalette } from "../../lib/utils/board-color-palette"
import { createCoverlayCircuit } from "../fixtures/coverlay-circuit"

test("black coverlay conceals covered copper and preserves amber edges", () => {
  const circuit = createCoverlayCircuit("black")
  const board = circuit.find((e) => e.type === "pcb_board")!
  board.solder_mask_color = "green"
  const original = structuredClone(circuit)
  expect(getBoardColorPalette(circuit)).toMatchObject({
    backgroundColor: "#111111",
    solderMaskWithCopperColor: "#111111",
    boardSideColor: "#cc9c33",
  })
  expect(circuit).toEqual(original)
})

test("white coverlay conceals covered copper", () => {
  expect(getBoardColorPalette(createCoverlayCircuit("white"))).toMatchObject({
    backgroundColor: "#ffffff",
    solderMaskWithCopperColor: "#ffffff",
  })
})

test("yellow coverlay retains a visible copper shade", () => {
  expect(getBoardColorPalette(createCoverlayCircuit("yellow"))).toMatchObject({
    backgroundColor: "#cc9c33",
    solderMaskWithCopperColor: "#b58a2d",
  })
})

test("rigid boards ignore coverlay metadata", () => {
  const circuit = createCoverlayCircuit("black")
  const board = circuit.find((e) => e.type === "pcb_board")!
  board.material = "fr4"
  const black = getBoardColorPalette(circuit)
  board.coverlay_color = "white"
  expect(getBoardColorPalette(circuit)).toEqual(black)
})

test("explicit renderer colors override coverlay metadata", () => {
  expect(
    getBoardColorPalette(createCoverlayCircuit("black"), {
      solderMaskColor: "#123456",
    }).backgroundColor,
  ).toBe("#123456")
})
