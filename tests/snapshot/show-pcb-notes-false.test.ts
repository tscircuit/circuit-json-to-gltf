import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"

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
    anchor_position: { x: 0, y: 0 },
    anchor_alignment: "center",
  },
]

test("pcb-note-hidden-when-showPcbNotes-false", async () => {
  const glb = await convertCircuitJsonToGltf(circuitWithPcbNote, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: false,
    showBoundingBoxes: false,
    showPcbNotes: false,
  })

  const cameraOptions = getBestCameraPosition(circuitWithPcbNote)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glb as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path)
})
