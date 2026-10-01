import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createBendZoneFlex } from "../fixtures/invalid-flex"

test("exact bend-zone via, trace corner and stiffener fixture still exports folded GLB", async () => {
  const input = createBendZoneFlex()
  const before = JSON.stringify(input)
  const flat = await convertCircuitJsonTo3D(input, {
    foldPcbs: false,
    renderBoardTextures: false,
  })
  const folded = await convertCircuitJsonTo3D(input, {
    foldPcbs: true,
    renderBoardTextures: false,
  })
  expect(folded.boxes.find((box) => box.label === "stiffener_in_zone")).toEqual(
    flat.boxes.find((box) => box.label === "stiffener_in_zone"),
  )
  expect(folded.boxes[0]!.mesh!.boundingBox.max.y).toBeGreaterThan(19)
  const glb = await convertCircuitJsonToGltf(input, {
    format: "glb",
    foldPcbs: true,
  })
  const mesh = parseGLB(glb as ArrayBuffer, COORDINATE_TRANSFORMS.IDENTITY)
  expect(mesh.boundingBox.max.y).toBeGreaterThan(19)
  expect(mesh.boundingBox.min.y).toBeCloseTo(-0.26)
  expect(JSON.stringify(input)).toBe(before)
})
