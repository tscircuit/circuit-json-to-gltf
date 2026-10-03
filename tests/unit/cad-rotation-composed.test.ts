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
  // Bottom motor: local Z90 followed by Y180. This distinguishes
  // the axis application order; all single-axis tests pass either way.
  const bottom = placeCadRotationProbe({ x: 0, y: Math.PI / 2, z: Math.PI })
  for (const [i, value] of [-9, 2, -10].entries())
    expect(bottom.positions[i]).toBeCloseTo(value, 8)
  for (const [i, value] of [0, -1, 0].entries())
    expect(bottom.normals[i]).toBeCloseTo(value, 8)
})
