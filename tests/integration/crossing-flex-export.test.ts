import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createCrossingFlex } from "../fixtures/invalid-flex"

test("crossing bend regions retain flat board and CAD without mutating input", async () => {
  const input = createCrossingFlex()
  const before = JSON.stringify(input)
  const flat = await convertCircuitJsonTo3D(input, {
    foldPcbs: false,
    renderBoardTextures: false,
  })
  const attemptedFold = await convertCircuitJsonTo3D(input, {
    foldPcbs: true,
    renderBoardTextures: false,
  })
  expect(attemptedFold.boxes).toEqual(flat.boxes)
  const glb = await convertCircuitJsonToGltf(input, {
    format: "glb",
    foldPcbs: true,
  })
  const mesh = parseGLB(glb as ArrayBuffer, COORDINATE_TRANSFORMS.IDENTITY)
  expect(mesh.boundingBox.max.y).toBeLessThan(0.7)
  expect(mesh.boundingBox.max.x - mesh.boundingBox.min.x).toBeCloseTo(40)
  expect(JSON.stringify(input)).toBe(before)
})
