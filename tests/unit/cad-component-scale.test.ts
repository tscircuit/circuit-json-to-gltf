import { test, expect } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"
import { resolve } from "node:path"

const UNIT_BOUNDS_STL_PATH = resolve(
  import.meta.dir,
  "../assets/unit-bounds.stl",
)

test("model_unit_to_mm_scale_factor scales meshes and sizes", async () => {
  const circuit = [
    {
      type: "source_component",
      source_component_id: "source1",
      name: "Test",
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      center: { x: 0, y: 0 },
      width: 1,
      height: 1,
      layer: "top",
    },
    {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      model_stl_url: UNIT_BOUNDS_STL_PATH,
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      size: { x: 1, y: 1, z: 1 },
      model_unit_to_mm_scale_factor: 2,
      model_object_fit: "fill_bounds",
    },
  ] as const

  const scene = await convertCircuitJsonTo3D(circuit as any, {
    renderBoardTextures: false,
  })

  expect(scene.boxes).toHaveLength(1)
  const box = scene.boxes[0]!

  expect(box.size.x).toBeCloseTo(2)
  expect(box.size.y).toBeCloseTo(2)
  expect(box.size.z).toBeCloseTo(2)

  expect(box.mesh).toBeDefined()
  expect(box.mesh!.boundingBox.max.x).toBeCloseTo(2)
  expect(box.mesh!.boundingBox.min.x).toBeCloseTo(0)
})

test("cad_component.size z maps to board-normal scene axis", async () => {
  const circuit = [
    {
      type: "source_component",
      source_component_id: "source1",
      name: "Test",
    },
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 0, y: 0 },
      width: 10,
      height: 10,
      thickness: 1.6,
    },
    {
      type: "pcb_component",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      pcb_board_id: "board1",
      center: { x: 2, y: 3 },
      width: 1,
      height: 1,
      layer: "top",
    },
    {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      model_stl_url: UNIT_BOUNDS_STL_PATH,
      size: { x: 10, y: 20, z: 30 },
      model_object_fit: "fill_bounds",
    },
  ] as const

  const scene = await convertCircuitJsonTo3D(circuit as any, {
    renderBoardTextures: false,
    showBoundingBoxes: false,
  })

  expect(scene.boxes).toHaveLength(2)

  const cadBox = scene.boxes.find(
    (box) => box.center.x === 2 && box.center.z === 3,
  )
  expect(cadBox).toBeDefined()
  expect(cadBox!.size).toEqual({ x: 10, y: 30, z: 20 })
  expect(cadBox!.center.y).toBeCloseTo(1.6 / 2 + 30 / 2)
})
