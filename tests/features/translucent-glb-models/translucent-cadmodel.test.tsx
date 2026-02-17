import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../../lib"
import { getBestCameraPosition } from "../../../lib/utils/camera-position"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"

test("translucent-cadmodel-standalone", async () => {
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
              rotationOffset={{ x: 0, y: 0, z: 180 }}
              showAsTranslucentModel
            />
          </cadassembly>
        }
      />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
  })

  const cameraOptions = getBestCameraPosition(circuitJson)

  const pngBuffer = await renderGLTFToPNGBufferFromGLBBuffer(
    glb as ArrayBuffer,
    {
      ...cameraOptions,
      backgroundColor: [1, 1, 1],
    },
  )

  expect(pngBuffer).toMatchPngSnapshot(
    import.meta.path,
    "translucent-cadmodel-standalone",
  )
})
