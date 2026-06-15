import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { renderGlbToPng } from "../renderGlbToPng"
import { convertCircuitJsonToGltf } from "../../lib"

test("translucent-models-3d-view", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="30mm" height="30mm">
      {/* Opaque chip on the left */}
      <chip name="U1" footprint="soic8" pcbX={-8} pcbY={0} />

      {/* Translucent chip in the middle */}
      <chip
        name="U2"
        footprint="soic8"
        pcbX={0}
        pcbY={0}
        showAsTranslucentModel
      />

      {/* Opaque resistor */}
      <resistor name="R1" footprint="0805" pcbX={8} pcbY={5} resistance="10k" />

      {/* Translucent resistor */}
      <resistor
        name="R2"
        footprint="0805"
        pcbX={8}
        pcbY={-5}
        resistance="22k"
        showAsTranslucentModel
      />

      {/* Translucent capacitor */}
      <capacitor
        name="C1"
        footprint="0603"
        pcbX={-8}
        pcbY={-8}
        capacitance="10uF"
        showAsTranslucentModel
      />

      {/* Add some traces */}
      <trace from={".U1 > .pin1"} to={".R1 > .pin1"} />
      <trace from={".U2 > .pin8"} to={".C1 > .pin1"} />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  const pngBuffer = await renderGlbToPng(glb as ArrayBuffer, circuitJson, {
    backgroundColor: [1, 1, 1],
  })

  expect(pngBuffer).toMatchPngSnapshot(
    import.meta.path,
    "translucent-models-3d-view",
  )
})
