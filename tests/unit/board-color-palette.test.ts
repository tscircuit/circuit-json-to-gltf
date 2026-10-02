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
    backgroundColor: "#0f4f30",
    boardSideColor: "#0b3c24",
    solderMaskWithCopperColor: "#17613b",
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

const flexBoard = {
  type: "pcb_board" as const,
  pcb_board_id: "flex_board",
  center: { x: 0, y: 0 },
  width: 20,
  height: 10,
  thickness: 0.12,
  num_layers: 2,
  material: "flex" as const,
}

test("flex material defaults to the viewer's polyimide amber", () => {
  for (const solderMaskColor of [undefined, "not_specified"]) {
    const circuit: CircuitJson = [
      { ...flexBoard, solder_mask_color: solderMaskColor },
    ]
    const original = structuredClone(circuit)
    expect(getBoardColorPalette(circuit)).toEqual({
      backgroundColor: "#cc9c33",
      boardSideColor: "#cc9c33",
      solderMaskWithCopperColor: "#937025",
      silkscreenColor: "#111827",
    })
    expect(circuit).toEqual(original)
  }
  const legacyUnset = [
    { ...flexBoard, soldermask_color: "not_specified" },
  ] as unknown as CircuitJson
  expect(getBoardColorPalette(legacyUnset).backgroundColor).toBe("#cc9c33")
  for (const solderMaskColor of ["not_specified", "", " "]) {
    expect(getBoardColorPalette([flexBoard], { solderMaskColor })).toEqual(
      getBoardColorPalette([flexBoard]),
    )
  }
})

test("explicit flex mask, legacy mask and silkscreen colors retain precedence", () => {
  const board = {
    ...flexBoard,
    solder_mask_color: "#aeb8c6",
    silkscreen_color: "white",
  }
  expect(getBoardColorPalette([board])).toEqual(
    deriveBoardColorPalette("#aeb8c6", "white"),
  )
  const legacy = [
    {
      ...board,
      solder_mask_color: "not_specified",
      soldermask_color: "#aeb8c6",
    },
  ] as unknown as CircuitJson
  expect(getBoardColorPalette(legacy)).toEqual(getBoardColorPalette([board]))
  expect(
    getBoardColorPalette([board], {
      solderMaskColor: "#123456",
      silkscreenColor: "#abcdef",
    }),
  ).toEqual(deriveBoardColorPalette("#123456", "#abcdef"))
  expect(
    getBoardColorPalette([{ ...flexBoard, silkscreen_color: "white" }])
      .silkscreenColor,
  ).toBe("#ffffff")
})

test("FR4 and unspecified materials keep their existing default palette", () => {
  for (const material of ["fr4", undefined]) {
    const circuit = [{ ...flexBoard, material }] as CircuitJson
    expect(getBoardColorPalette(circuit)).toEqual({
      silkscreenColor: undefined,
    })
  }
})
