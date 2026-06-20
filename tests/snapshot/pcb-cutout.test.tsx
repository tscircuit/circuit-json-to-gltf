import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { renderGlbToPng } from "../renderGlbToPng"
import { convertCircuitJsonToGltf } from "../../lib"

test("pcb-cutout-snapshot", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="28mm" height="22mm">
      <cutout
        shape="polygon"
        points={[
          { x: -4, y: -2 },
          { x: 4, y: -2 },
          { x: 6, y: 0 },
          { x: 4, y: 2 },
          { x: -4, y: 2 },
        ]}
        pcbX={0}
        pcbY={0}
      />
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
