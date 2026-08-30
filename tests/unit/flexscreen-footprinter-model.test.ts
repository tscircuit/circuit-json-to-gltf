import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"

test("renders a flexscreen cad_component footprinter string as a mesh", async () => {
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

  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
    showBoundingBoxes: false,
  })

  const screen = scene.boxes.find((box) => box.label === "SCREEN")
  expect(screen?.mesh).toBeDefined()
  expect(screen?.mesh?.triangles.length).toBeGreaterThan(0)
  expect(screen?.size.x).toBeGreaterThan(0)
  expect(screen?.size.y).toBeGreaterThan(0)
  expect(screen?.size.z).toBeGreaterThan(0)
})
