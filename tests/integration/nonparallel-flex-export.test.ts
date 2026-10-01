import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createNonparallelFlex } from "../fixtures/invalid-flex"

test("nonparallel bends export a flat board and CAD without mutating input", async () => {
  const input = createNonparallelFlex()
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
  expect(mesh.boundingBox.max.x - mesh.boundingBox.min.x).toBeCloseTo(60)
  expect(JSON.stringify(input)).toBe(before)
})
