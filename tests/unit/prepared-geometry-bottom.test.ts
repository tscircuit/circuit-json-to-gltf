import { expect, test } from "bun:test"
import { prepareBoardGeometry } from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("implicit bottom OBJ placement flips two axes without inverting or repeating CAD rotation", async () => {
  const circuitJson = geometryCircuit({
    model_origin_position: { x: 0, y: 0, z: 0 },
  })
  const pcb = circuitJson.find((item) => item.type === "pcb_component")
  if (pcb?.type !== "pcb_component") throw new Error("Missing PCB")
  pcb.layer = "bottom"
  const prepared = await prepareBoardGeometry({
    circuitJson,
    pcbBoardId: "board",
  })
  const body = prepared.components[0]
  if (body?.status !== "available") throw new Error("Missing geometry")
  expect(body.bounds.min.x).toBeCloseTo(4, 12)
  expect(body.bounds.max.x).toBeCloseTo(8, 12)
  expect(body.bounds.min.y).toBeCloseTo(-4, 12)
  expect(body.bounds.max.y).toBeCloseTo(2, 12)
  expect(body.bounds.min.z).toBeCloseTo(-6.2, 12)
  expect(body.bounds.max.z).toBeCloseTo(-2.2, 12)
})
