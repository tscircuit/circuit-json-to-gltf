import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import {
  deriveBoardColorPalette,
  getBoardColorPalette,
} from "../../lib/utils/board-color-palette"

test("derives a complete palette from a light solder mask", () => {
  expect(deriveBoardColorPalette("#aeb8c6")).toEqual({
    backgroundColor: "#aeb8c6",
    boardSideColor: "#969eaa",
    solderMaskWithCopperColor: "#7d848f",
    silkscreenColor: "#111827",
  })
})

test("derives contrasting colors for named dark solder masks", () => {
  expect(deriveBoardColorPalette("green")).toEqual({
    backgroundColor: "#0f3812",
    boardSideColor: "#0b2b0e",
    solderMaskWithCopperColor: "#5c785e",
    silkscreenColor: "#ffffff",
  })
})

test("uses pcb_board colors and supports the soldermask_color alias", () => {
  const canonicalCircuit: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board",
      center: { x: 0, y: 0 },
      width: 10,
      height: 10,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
      solder_mask_color: "#aeb8c6",
      silkscreen_color: "white",
    },
  ]
  const aliasCircuit = [
    {
      ...canonicalCircuit[0],
      solder_mask_color: undefined,
      soldermask_color: "#aeb8c6",
    },
  ] as unknown as CircuitJson

  expect(getBoardColorPalette(canonicalCircuit)).toEqual(
    getBoardColorPalette(aliasCircuit),
  )
  expect(getBoardColorPalette(canonicalCircuit).silkscreenColor).toBe("#ffffff")
})
