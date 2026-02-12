import { test, expect } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"

test("drawFauxBoard adds board when no pcb_board exists", async () => {
  const circuitWithoutBoard = [
    {
      type: "source_component",
      source_component_id: "source1",
      name: "U1",
    },
    {
      type: "pcb_component",
      pcb_component_id: "comp1",
      source_component_id: "source1",
      center: { x: 15, y: 5 },
      width: 4,
      height: 6,
      layer: "top",
    },
  ]

  const withoutFauxBoard = await convertCircuitJsonTo3D(
    circuitWithoutBoard as any,
    {
      renderBoardTextures: false,
      drawFauxBoard: false,
    },
  )

  const withFauxBoard = await convertCircuitJsonTo3D(
    circuitWithoutBoard as any,
    {
      renderBoardTextures: false,
      drawFauxBoard: true,
    },
  )

  expect(withoutFauxBoard.boxes).toHaveLength(1)
  expect(withoutFauxBoard.boxes[0]?.label).toBe("U1")

  expect(withFauxBoard.boxes).toHaveLength(2)

  const fauxBoard = withFauxBoard.boxes.find(
    (box) => box.label === undefined && box.size.y === 1.6,
  )

  expect(fauxBoard).toBeDefined()
  expect(fauxBoard?.center.x).toBe(15)
  expect(fauxBoard?.center.y).toBe(5)
  expect(fauxBoard?.size.x).toBe(10)
  expect(fauxBoard?.size.z).toBe(10)
})
