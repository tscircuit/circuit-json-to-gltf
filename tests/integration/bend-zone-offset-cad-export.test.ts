import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"
import { createBendZoneFlex } from "../fixtures/invalid-flex"

test("invalid PCB mounts keep offset models flat even when their geometry clears the bend zone", async () => {
  const input = createBendZoneFlex(true).map((element) =>
    element.type === "cad_component" && element.cad_component_id === "cad_R1"
      ? { ...element, position: { ...element.position, x: -8 } }
      : element,
  )
  const flat = await convertCircuitJsonTo3D(input, {
    foldPcbs: false,
    renderBoardTextures: false,
  })
  const folded = await convertCircuitJsonTo3D(input, {
    foldPcbs: true,
    renderBoardTextures: false,
  })
  expect(folded.boxes.find((box) => box.label === "R1")).toEqual(
    flat.boxes.find((box) => box.label === "R1"),
  )
  expect(
    folded.boxes.find((box) => box.label === "R3")!.center.y,
  ).toBeGreaterThan(7)
})
