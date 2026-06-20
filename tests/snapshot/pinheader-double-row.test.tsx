import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { renderGlbToPng } from "../renderGlbToPng"
import { convertCircuitJsonToGltf } from "../../lib"

test("pinheader-double-row-snapshot", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board>
      <pinheader name="U1" doubleRow pinCount={16} footprint="pinrow16_rows2" />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)

  expect(renderGlbToPng(glb as ArrayBuffer, circuitJson)).toMatchPngSnapshot(
    import.meta.path,
  )
})
