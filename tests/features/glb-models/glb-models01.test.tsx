import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { renderGlbToPng } from "../../helpers"
import { convertCircuitJsonToGltf } from "../../../lib"

test("glb-models01", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="10mm" height="10mm">
      <chip
        footprint="soic8"
        name="U1"
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

  expect(renderGlbToPng(glb as ArrayBuffer, circuitJson)).toMatchPngSnapshot(
    import.meta.path,
  )
})
