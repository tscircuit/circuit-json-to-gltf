import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { renderGlbToPng } from "../../helpers"
import { convertCircuitJsonToGltf } from "../../../lib"

test("translucent-glb-model-single", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="10mm" height="10mm">
      <chip
        footprint="soic8"
        name="U1"
        showAsTranslucentModel
        cadModel={{
          glbUrl: "https://modelcdn.tscircuit.com/jscad_models/soic8.glb",
        }}
      />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
  })

  const pngBuffer = await renderGlbToPng(glb as ArrayBuffer, circuitJson, {
    backgroundColor: [1, 1, 1],
  })

  expect(pngBuffer).toMatchPngSnapshot(
    import.meta.path,
    "translucent-glb-model-single",
  )
})
