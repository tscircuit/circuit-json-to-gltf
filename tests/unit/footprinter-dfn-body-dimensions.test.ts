import { expect, test } from "bun:test"
import { loadFootprinterModel } from "../../lib/loaders/footprinter"

test("DFN mesh uses its authored mechanical body length", async () => {
  const model = await loadFootprinterModel(
    "dfn2_w0.65mm_h0.4mm_bodywidth0.65mm_bodylength0.4mm_p0.4mm",
  )

  expect(model).toBeDefined()
  const modelExtents = [
    model!.boundingBox.max.x - model!.boundingBox.min.x,
    model!.boundingBox.max.y - model!.boundingBox.min.y,
    model!.boundingBox.max.z - model!.boundingBox.min.z,
  ].sort((first, second) => first - second)

  expect(modelExtents[0]).toBeCloseTo(0.6, 2)
  expect(modelExtents[1]).toBeCloseTo(1.005, 2)
  expect(modelExtents[2]).toBeCloseTo(1.35, 2)
})
