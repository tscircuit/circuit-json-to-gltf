import { expect, test } from "bun:test"
import { placeCadRotationProbe } from "../fixtures/cad-rotation-probe"

test("combined CAD rotations match the viewer's intrinsic XYZ order", () => {
  // Probe at circuit (1,2,3), normal +Z. Z90 -> (-2,1,3),
  // Y90 -> (3,1,2), X90 -> (3,-2,1). Then scene (-X,Z,Y),
  // with the fixture's circuit translation (7,-11,5).
  const allAxes = placeCadRotationProbe({
    x: Math.PI / 2,
    y: Math.PI / 2,
    z: Math.PI / 2,
  })
  for (const [i, value] of [-10, 6, -13].entries())
    expect(allAxes.positions[i]).toBeCloseTo(value, 8)
  for (const [i, value] of [-1, 0, 0].entries())
    expect(allAxes.normals[i]).toBeCloseTo(value, 8)
  // Circuit Y90 then X90: (1,2,3) -> (3,2,-1) -> (3,1,2).
  const tilted = placeCadRotationProbe({ x: Math.PI / 2, y: 0, z: Math.PI / 2 })
  for (const [i, value] of [-10, 7, -10].entries())
    expect(tilted.positions[i]).toBeCloseTo(value, 8)
  for (const [i, value] of [-1, 0, 0].entries())
    expect(tilted.normals[i]).toBeCloseTo(value, 8)
})
