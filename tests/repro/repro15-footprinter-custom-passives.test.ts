import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"

const circuit = [
  {
    type: "pcb_board",
    pcb_board_id: "pcb_board_0",
    center: { x: 0, y: 0 },
    width: 10,
    height: 10,
  },
  {
    type: "source_component",
    source_component_id: "source_component_r1",
    name: "R1",
  },
  {
    type: "pcb_component",
    pcb_component_id: "pcb_component_r1",
    source_component_id: "source_component_r1",
    center: { x: -2, y: 0 },
    width: 1.6,
    height: 0.95,
    layer: "top",
  },
  {
    type: "cad_component",
    cad_component_id: "cad_component_r1",
    pcb_component_id: "pcb_component_r1",
    source_component_id: "source_component_r1",
    position: { x: -2, y: 0, z: 0.7 },
    rotation: { x: 0, y: 0, z: 90 },
    footprinter_string: "res_p1.6mm_pw0.95mm_ph1mm",
  },
  {
    type: "source_component",
    source_component_id: "source_component_c1",
    name: "C1",
  },
  {
    type: "pcb_component",
    pcb_component_id: "pcb_component_c1",
    source_component_id: "source_component_c1",
    center: { x: 2, y: 0 },
    width: 1.6,
    height: 0.95,
    layer: "top",
  },
  {
    type: "cad_component",
    cad_component_id: "cad_component_c1",
    pcb_component_id: "pcb_component_c1",
    source_component_id: "source_component_c1",
    position: { x: 2, y: 0, z: 0.7 },
    rotation: { x: 0, y: 0, z: 0 },
    footprinter_string: "cap_p1.6mm_pw0.95mm_ph1mm",
  },
]

test("custom passive footprinter models are present and use the requested pitch", async () => {
  const scene = await convertCircuitJsonTo3D(circuit as any, {
    renderBoardTextures: false,
  })

  const resistor = scene.boxes.find((box) => box.label === "R1")
  const capacitor = scene.boxes.find((box) => box.label === "C1")

  expect(resistor?.mesh?.triangles.length).toBeGreaterThan(0)
  expect(capacitor?.mesh?.triangles.length).toBeGreaterThan(0)

  expect(resistor?.size.x).toBeCloseTo(1.6, 4)
  expect(resistor?.size.z).toBeCloseTo(0.85, 4)
  expect(capacitor?.size.x).toBeCloseTo(1.6, 4)
  expect(capacitor?.size.z).toBeCloseTo(0.85, 4)
})
