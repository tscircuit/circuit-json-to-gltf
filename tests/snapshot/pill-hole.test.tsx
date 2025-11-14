import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"

test("pill-hole-snapshot", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="30mm" height="20mm">
      <hole shape="pill" width="2mm" height="5mm" pcbX={-5} pcbY={0} />
      <hole
        shape="pill"
        width="5mm"
        height="2mm"
        pcbX={0}
        pcbY={0}
        pcbRotation="45deg"
      />
      <hole
        shape="pill"
        width="2mm"
        height="5mm"
        pcbX={7}
        pcbY={0}
        pcbRotation="45deg"
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
  const cameraOptions = getBestCameraPosition(circuitJson)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glb as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path)
})
