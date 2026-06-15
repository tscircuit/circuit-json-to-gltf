import { expect, test } from "bun:test"
import { renderGlbToPng } from "../helpers"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"

const circuitWithPcbNote: CircuitJson = [
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
  {
    type: "pcb_note_text",
    pcb_note_text_id: "note1",
    text: "NOTE",
    font: "tscircuit2024",
    font_size: 1.4,
    layer: "top",
    anchor_position: { x: 0, y: 0 },
    anchor_alignment: "center",
  },
]

test("pcb-note-visible-when-showPcbNotes-true", async () => {
  const glb = await convertCircuitJsonToGltf(circuitWithPcbNote, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: false,
    showBoundingBoxes: false,
    showPcbNotes: true,
  })

  expect(
    renderGlbToPng(glb as ArrayBuffer, circuitWithPcbNote),
  ).toMatchPngSnapshot(import.meta.path)
})
