import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { renderGlbToPng } from "../../helpers"
import { convertCircuitJsonToGltf } from "../../../lib"

test("translucent-vs-opaque-glb-models", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="20mm" height="10mm">
      {/* Opaque GLB model */}
      <chip
        footprint="soic8"
        name="U1_Opaque"
        pcbX={-5}
        pcbY={0}
        cadModel={{
          glbUrl: "https://modelcdn.tscircuit.com/jscad_models/soic8.glb",
        }}
      />

      {/* Translucent GLB model */}
      <chip
        footprint="soic8"
        name="U2_Translucent"
        pcbX={5}
        pcbY={0}
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
    "translucent-vs-opaque-glb-models",
  )
})
