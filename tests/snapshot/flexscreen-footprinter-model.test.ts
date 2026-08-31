import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGlbToPng } from "../renderGlbToPng"

test("flexscreen footprinter model snapshot", async () => {
  const circuitJson = [
    {
      type: "source_component",
      source_component_id: "source_screen",
      ftype: "simple_chip",
      name: "SCREEN",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb_screen",
      source_component_id: "source_screen",
      center: { x: 0, y: 0 },
      width: 0,
      height: 0,
      layer: "top",
      rotation: 0,
    },
    {
      type: "cad_component",
      cad_component_id: "cad_screen",
      pcb_component_id: "pcb_screen",
      source_component_id: "source_screen",
      position: { x: 0, y: 0, z: 0.8 },
      rotation: { x: 0, y: 0, z: 0 },
      model_origin_position: { x: 0, y: 0, z: 0 },
      footprinter_string:
        "flexscreen_w40mm_h22.5mm_flex60mm_foldsabove_distance20mm_foldstart9mm_outset6mm",
    },
  ] as CircuitJson

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    showBoundingBoxes: false,
  })

  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect(
    renderGlbToPng(glb as ArrayBuffer, circuitJson, {
      backgroundColor: [1, 1, 1],
      // poppygl camera coordinates are in the glTF frame: +Y is up, in mm.
      camPos: [55, 55, 45],
      lookAt: [0, 11, -12],
      supersampling: 2,
    }),
  ).toMatchPngSnapshot(import.meta.path)
})
