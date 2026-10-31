import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { renderBoardLayer } from "../lib/converters/board-renderer"

const board: CircuitJson = [
  {
    type: "pcb_board",
    pcb_board_id: "board1",
    center: { x: 0, y: 0 },
    width: 20,
    height: 12,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  },
]

const topFabricationNotes: CircuitJson = [
  {
    type: "pcb_fabrication_note_path",
    pcb_fabrication_note_path_id: "fab_path1",
    pcb_component_id: "component1",
    layer: "top",
    route: [
      { x: -4, y: 0 },
      { x: 4, y: 0 },
    ],
    stroke_width: 0.8,
    color: "#ff00ff",
  },
  {
    type: "pcb_fabrication_note_text",
    pcb_fabrication_note_text_id: "fab_text1",
    pcb_component_id: "component1",
    layer: "top",
    text: "FAB",
    font: "tscircuit2024",
    font_size: 1.5,
    anchor_position: { x: 0, y: 2 },
    anchor_alignment: "center",
    color: "#ff00ff",
  },
  {
    type: "pcb_fabrication_note_rect",
    pcb_fabrication_note_rect_id: "fab_rect1",
    pcb_component_id: "component1",
    layer: "top",
    center: { x: 0, y: -2 },
    width: 4,
    height: 2,
    stroke_width: 0.5,
    color: "#ff00ff",
  },
  {
    type: "pcb_fabrication_note_dimension",
    pcb_fabrication_note_dimension_id: "fab_dimension1",
    pcb_component_id: "component1",
    layer: "top",
    from: { x: -3, y: -4 },
    to: { x: 3, y: -4 },
    arrow_size: 0.5,
    font: "tscircuit2024",
    font_size: 1,
    color: "#ff00ff",
  },
]

const render = (
  circuitJson: CircuitJson,
  layer: "top" | "bottom",
  showPcbNotes?: boolean,
) =>
  renderBoardLayer(circuitJson, {
    layer,
    resolution: 64,
    backgroundColor: "#0f3812",
    showPcbNotes,
  })

test("fabrication annotations are omitted from physical board textures", async () => {
  const baseline = await render(board, "top", false)
  const withFabricationNotesByDefault = await render(
    [...board, ...topFabricationNotes],
    "top",
  )
  const withFabricationNotes = await render(
    [...board, ...topFabricationNotes],
    "top",
    false,
  )

  expect(withFabricationNotesByDefault).toBe(baseline)
  expect(withFabricationNotes).toBe(baseline)
})

test("opted-in fabrication annotations render only on their declared board side", async () => {
  const circuitWithTopPath = [board[0]!, topFabricationNotes[0]!] as CircuitJson
  const topBaseline = await render(board, "top", true)
  const bottomBaseline = await render(board, "bottom", true)
  const topWithPath = await render(circuitWithTopPath, "top", true)
  const bottomWithPath = await render(circuitWithTopPath, "bottom", true)

  expect(topWithPath).not.toBe(topBaseline)
  expect(bottomWithPath).toBe(bottomBaseline)
})
