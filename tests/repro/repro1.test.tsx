import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { renderGlbToPng } from "../helpers"
import { convertCircuitJsonToGltf } from "../../lib"

test("silkscreen text font sizing behavior", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="10mm" height="10mm">
      <silkscreentext text="Hello, World!" fontSize="1mm" />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()

  // Convert circuit to GLTF (GLB format for rendering)
  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  // Ensure we got a valid GLB buffer
  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)

  // Render the GLB to PNG with camera position derived from circuit dimensions

  expect(renderGlbToPng(glb as ArrayBuffer, circuitJson)).toMatchPngSnapshot(
    import.meta.path,
  )
})
