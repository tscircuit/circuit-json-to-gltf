import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf, renderBoardTextures } from "../../lib"

const board: CircuitJson = [
  {
    type: "pcb_board",
    pcb_board_id: "board",
    center: { x: 0, y: 0 },
    width: 20,
    height: 20,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  },
]

const silkscreen: CircuitJson = ["top", "bottom"].map((layer) => ({
  type: "pcb_silkscreen_path",
  pcb_silkscreen_path_id: `silkscreen_${layer}`,
  layer,
  route: [
    { x: -4, y: -4 },
    { x: 4, y: -4 },
  ],
  stroke_width: 0.5,
})) as CircuitJson

const fabricationNotes: CircuitJson = ["top", "bottom"].flatMap((layer) => [
  {
    type: "pcb_fabrication_note_text",
    pcb_fabrication_note_text_id: `text_${layer}`,
    layer,
    text: "FAB",
    font: "tscircuit2024",
    font_size: 2,
    anchor_position: { x: 0, y: 0 },
    anchor_alignment: "center",
  },
  {
    type: "pcb_fabrication_note_path",
    pcb_fabrication_note_path_id: `path_${layer}`,
    layer,
    route: [
      { x: -5, y: 3 },
      { x: 5, y: 3 },
    ],
    stroke_width: 0.5,
  },
  {
    type: "pcb_fabrication_note_rect",
    pcb_fabrication_note_rect_id: `rect_${layer}`,
    layer,
    center: { x: 0, y: 0 },
    width: 12,
    height: 12,
    stroke_width: 0.5,
  },
  {
    type: "pcb_fabrication_note_dimension",
    pcb_fabrication_note_dimension_id: `dimension_${layer}`,
    layer,
    from: { x: -5, y: 6 },
    to: { x: 5, y: 6 },
    font_size: 1,
    arrow_size: 0.5,
  },
]) as CircuitJson

test("board textures omit fabrication notes on both sides and retain silkscreen", async () => {
  const options = { resolution: 128 }
  const bare = await renderBoardTextures(board, options)
  const expected = await renderBoardTextures([...board, ...silkscreen], options)
  expect(expected.top).not.toBe(bare.top)
  expect(expected.bottom).not.toBe(bare.bottom)

  for (const note of fabricationNotes) {
    const actual = await renderBoardTextures(
      [...board, ...silkscreen, note],
      options,
    )
    expect(actual.top).toBe(expected.top)
    expect(actual.bottom).toBe(expected.bottom)
  }
})

test("GLB export is unchanged by fabrication notes", async () => {
  const options = { format: "glb" as const, boardTextureResolution: 128 }
  const expected = await convertCircuitJsonToGltf(
    [...board, ...silkscreen],
    options,
  )
  const actual = await convertCircuitJsonToGltf(
    [...board, ...silkscreen, ...fabricationNotes],
    options,
  )
  expect(actual).toBeInstanceOf(ArrayBuffer)
  expect(new Uint8Array(actual as ArrayBuffer)).toEqual(
    new Uint8Array(expected as ArrayBuffer),
  )
})
