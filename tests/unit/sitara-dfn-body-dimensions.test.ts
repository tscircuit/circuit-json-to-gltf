import { expect, test } from "bun:test"
import { loadFootprinterModel } from "../../lib/loaders/footprinter"

test("captures the Sitara DFN mesh dimensions through Footprinter and GLB", async () => {
  const model = await loadFootprinterModel(
    "dfn2_w0.65mm_h0.4mm_bodywidth0.65mm_bodylength0.4mm_p0.4mm",
  )
  if (!model) throw new Error("DFN model did not load")

  // The loader returns glTF-frame bounds in millimeters: X across the body,
  // +Y above its seating plane, and Z along the body length.
  const { min, max } = model.boundingBox
  expect({
    widthMm: Number((max.x - min.x).toFixed(3)),
    heightMm: Number((max.y - min.y).toFixed(3)),
    lengthMm: Number((max.z - min.z).toFixed(3)),
  }).toMatchInlineSnapshot(`
    {
      "heightMm": 1.005,
      "lengthMm": 0.6,
      "widthMm": 1.35,
    }
  `)
})
