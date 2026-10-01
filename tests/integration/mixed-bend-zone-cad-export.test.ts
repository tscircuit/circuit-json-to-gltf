import { expect, test } from "bun:test"
import { transformCircuitJsonCadComponents } from "@tscircuit/flex-utils"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createBendZoneFlex } from "../fixtures/invalid-flex"

test("invalid rigid CAD stays flat while valid pre-folded CAD and the board still fold", async () => {
  const input = createBendZoneFlex(true)
  const preFolded = transformCircuitJsonCadComponents(
    input.filter(
      (element) =>
        element.type !== "cad_component" ||
        element.cad_component_id !== "cad_R1",
    ),
    { foldPcbs: true },
  )
  const mixedInput = input.map((element) =>
    element.type === "cad_component" && element.cad_component_id === "cad_R3"
      ? preFolded.find(
          (record) =>
            record.type === "cad_component" &&
            record.cad_component_id === "cad_R3",
        )!
      : element,
  )
  const before = JSON.stringify({ input, mixedInput })
  const flat = await convertCircuitJsonTo3D(input, {
    foldPcbs: false,
    renderBoardTextures: false,
  })
  const folded = await convertCircuitJsonTo3D(mixedInput, {
    renderBoardTextures: false,
  })
  expect(folded.boxes.find((box) => box.label === "R1")).toEqual(
    flat.boxes.find((box) => box.label === "R1"),
  )
  expect(
    folded.boxes.find((box) => box.label === "R3")!.center.y,
  ).toBeGreaterThan(7)
  for (const foldPcbs of [false, true]) {
    const fromFlat = await convertCircuitJsonTo3D(input, {
      foldPcbs,
      renderBoardTextures: false,
    })
    const fromMixed = await convertCircuitJsonTo3D(mixedInput, {
      foldPcbs,
      renderBoardTextures: false,
    })
    for (const [index, box] of fromFlat.boxes.entries()) {
      const restored = fromMixed.boxes[index]!
      expect(restored.label).toBe(box.label)
      for (const axis of ["x", "y", "z"] as const)
        expect(restored.center[axis]).toBeCloseTo(box.center[axis], 7)
    }
  }
  const glb = await convertCircuitJsonToGltf(mixedInput, { format: "glb" })
  expect(
    parseGLB(glb as ArrayBuffer, COORDINATE_TRANSFORMS.IDENTITY).boundingBox.max
      .y,
  ).toBeGreaterThan(19)
  expect(JSON.stringify({ input, mixedInput })).toBe(before)
})
