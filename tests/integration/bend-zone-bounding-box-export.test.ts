import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"
import { createBendZoneFlex } from "../fixtures/invalid-flex"

test("debug bounding boxes in a bend zone remain flat without blocking other components", async () => {
  const input = createBendZoneFlex(true).map((element) =>
    element.type === "cad_component"
      ? { ...element, model_jscad: undefined, show_as_bounding_box: true }
      : element,
  )
  const flat = await convertCircuitJsonTo3D(input, {
    foldPcbs: false,
    showBoundingBoxes: true,
    renderBoardTextures: false,
  })
  const folded = await convertCircuitJsonTo3D(input, {
    foldPcbs: true,
    showBoundingBoxes: true,
    renderBoardTextures: false,
  })
  expect(folded.boxes.find((box) => box.label === "R1")).toEqual(
    flat.boxes.find((box) => box.label === "R1"),
  )
  expect(
    folded.boxes.find((box) => box.label === "R3")!.center.y,
  ).toBeGreaterThan(7)
})
