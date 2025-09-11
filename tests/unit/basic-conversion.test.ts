import { test, expect } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"

test("convertCircuitJsonTo3D should work without textures", async () => {
  const simpleCircuit = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 0, y: 0 },
      width: 50,
      height: 30,
      thickness: 1.6,
    },
  ]

  const scene = await convertCircuitJsonTo3D(simpleCircuit as any, {
    renderBoardTextures: false, // Skip texture rendering
  })

  expect(scene).toBeDefined()
  expect(scene.boxes).toHaveLength(1)
  expect(scene.boxes[0]!.size.x).toBe(50)
  expect(scene.boxes[0]!.size.z).toBe(30)
  expect(scene.boxes[0]!.size.y).toBe(1.6)
})
