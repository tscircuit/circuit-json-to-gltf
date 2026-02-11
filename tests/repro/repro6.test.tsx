import { expect, test } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { Circuit } from "tscircuit"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"

test("STEP CAD Model should be included in GLTF output", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="10mm" height="10mm">
      <chip
        name="U1"
        footprint="soic8"
        cadModel={
          <cadassembly>
            <cadmodel
              modelUrl="https://modelcdn.tscircuit.com/jscad_models/soic8.step"
              rotationOffset={{ x: 0, y: 180, z: 180 }}
            />
          </cadassembly>
        }
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
