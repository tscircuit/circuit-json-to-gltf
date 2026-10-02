import { expect, test } from "bun:test"
import { transformCircuitJsonCadComponents } from "@tscircuit/flex-utils"
import { convertCircuitJsonTo3D, type Scene3D } from "../../lib"
import { createFiniteTailFlex } from "../fixtures/finite-tail-flex"

/** Compare emitted Scene3D geometry: +X right, +Y above, +Z circuit top,
 * millimeters. Centers/vertices are points; normals are directions.
 */
function expectSameGeometry(actual: Scene3D, expected: Scene3D) {
  expect(actual.boxes.map((box) => box.label)).toEqual(
    expected.boxes.map((box) => box.label),
  )
  for (const [boxIndex, expectedBox] of expected.boxes.entries()) {
    const actualBox = actual.boxes[boxIndex]!
    for (const axis of ["x", "y", "z"] as const) {
      expect(actualBox.center[axis]).toBeCloseTo(expectedBox.center[axis], 7)
      expect(actualBox.rotation?.[axis] ?? 0).toBeCloseTo(
        expectedBox.rotation?.[axis] ?? 0,
        7,
      )
    }
    expect(actualBox.mesh?.triangles.length).toBe(
      expectedBox.mesh?.triangles.length,
    )
    for (const [triangleIndex, triangle] of (
      expectedBox.mesh?.triangles ?? []
    ).entries()) {
      const actualTriangle = actualBox.mesh!.triangles[triangleIndex]!
      for (const axis of ["x", "y", "z"] as const) {
        expect(actualTriangle.normal[axis]).toBeCloseTo(
          triangle.normal[axis],
          6,
        )
        for (let vertexIndex = 0; vertexIndex < 3; vertexIndex++)
          expect(actualTriangle.vertices[vertexIndex]![axis]).toBeCloseTo(
            triangle.vertices[vertexIndex]![axis],
            6,
          )
      }
    }
  }
}

test("finite left-tail export preserves the right tail and pre-folded CAD at any board center", async () => {
  for (const boardCenter of [
    { x: 0, y: 0 },
    { x: 100, y: -70 },
  ]) {
    const flatInput = createFiniteTailFlex(boardCenter)
    const foldedInput = transformCircuitJsonCadComponents(flatInput, {
      foldPcbs: true,
    })
    const before = JSON.stringify({ flatInput, foldedInput })
    const flat = await convertCircuitJsonTo3D(flatInput, {
      foldPcbs: false,
      renderBoardTextures: false,
    })
    const folded = await convertCircuitJsonTo3D(flatInput, {
      foldPcbs: true,
      renderBoardTextures: false,
    })
    const left = folded.boxes.find((box) => box.label === "RL")!
    const right = folded.boxes.find((box) => box.label === "RR")!
    const flatRight = flat.boxes.find((box) => box.label === "RR")!
    expect(left.center.x).toBeCloseTo(boardCenter.x - 16, 7)
    expect(left.center.y).toBeCloseTo(6 - Math.PI / 4, 7)
    expect(right.center).toEqual(flatRight.center)

    const board = folded.boxes[0]!
    expect(board.center).toEqual({
      x: boardCenter.x,
      y: 0,
      z: boardCenter.y,
    })
    const boardVertices = board.mesh!.triangles.flatMap(
      (triangle) => triangle.vertices,
    )
    expect(boardVertices.some((vertex) => vertex.x < -12 && vertex.y > 9)).toBe(
      true,
    )
    for (const vertex of boardVertices.filter((vertex) => vertex.x > 12))
      expect(Math.abs(vertex.y)).toBeLessThanOrEqual(0.06 + 1e-7)

    for (const [foldPcbs, expected] of [
      [false, flat],
      [true, folded],
    ] as const) {
      const fromFoldedInput = await convertCircuitJsonTo3D(foldedInput, {
        foldPcbs,
        renderBoardTextures: false,
      })
      expectSameGeometry(fromFoldedInput, expected)
    }
    expectSameGeometry(
      await convertCircuitJsonTo3D(foldedInput, { renderBoardTextures: false }),
      folded,
    )
    expectSameGeometry(
      await convertCircuitJsonTo3D(flatInput, { renderBoardTextures: false }),
      flat,
    )
    expect(JSON.stringify({ flatInput, foldedInput })).toBe(before)
  }
})
