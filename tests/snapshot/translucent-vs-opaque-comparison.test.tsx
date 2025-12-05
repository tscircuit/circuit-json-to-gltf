import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"

test("translucent-vs-opaque-comparison", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="25mm" height="15mm">
      {/* Opaque chip */}
      <chip name="U1_Opaque" footprint="soic8" pcbX={-6} pcbY={0} />

      {/* Translucent chip */}
      <chip
        name="U2_Translucent"
        footprint="soic8"
        pcbX={6}
        pcbY={0}
        showAsTranslucentModel
      />

      <fabricationnotetext
        text="OPAQUE"
        anchorAlignment="center"
        fontSize="1mm"
        pcbX={-6}
        pcbY={-6}
      />

      <fabricationnotetext
        text="TRANSLUCENT"
        anchorAlignment="center"
        fontSize="1mm"
        pcbX={6}
        pcbY={-6}
      />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
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
    "translucent-vs-opaque-comparison",
  )
})
