import { expect, test } from "bun:test"
import { prepareBoardGeometry } from "../../lib/geometry"
import { geometryBoard } from "../fixtures/geometry-circuit"

test("serialized board geometry retains the drilled opening instead of an AABB envelope", async () => {
  const prepared = await prepareBoardGeometry({
    pcbBoardId: "board",
    circuitJson: [
      geometryBoard,
      {
        type: "pcb_hole",
        pcb_hole_id: "hole",
        x: 3,
        y: 4,
        hole_shape: "circle",
        hole_diameter: 4,
      },
    ],
  })
  const replay = JSON.parse(JSON.stringify(prepared)) as typeof prepared
  expect(replay.board.bounds).toEqual({
    min: { x: -10, y: -8, z: -0.8 },
    max: { x: 10, y: 8, z: 0.8 },
  })
  let topArea = 0
  for (const triangle of replay.board.mesh.triangles) {
    if (triangle.normal.y < 0.9) continue
    const [a, b, c] = triangle.vertices
    topArea +=
      Math.abs((b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x)) / 2
  }
  expect(topArea).toBeCloseTo(
    20 * 16 - 24 * 2 * Math.sin((2 * Math.PI) / 24),
    6,
  )
  expect(topArea).toBeLessThan(20 * 16 - 12)
})
