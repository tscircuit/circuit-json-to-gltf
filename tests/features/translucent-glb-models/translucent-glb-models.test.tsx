import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../../lib"
import { getBestCameraPosition } from "../../../lib/utils/camera-position"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"

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
    "translucent-glb-model-single",
  )
})

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
    "translucent-vs-opaque-glb-models",
  )
})

test("multiple-translucent-glb-models", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="30mm" height="30mm">
      {/* Grid of alternating opaque and translucent models */}
      <chip
        footprint="soic8"
        name="U1"
        pcbX={-8}
        pcbY={8}
        cadModel={{
          glbUrl: "https://modelcdn.tscircuit.com/jscad_models/soic8.glb",
        }}
      />
      <chip
        footprint="soic8"
        name="U2"
        pcbX={0}
        pcbY={8}
        showAsTranslucentModel
        cadModel={{
          glbUrl: "https://modelcdn.tscircuit.com/jscad_models/soic8.glb",
        }}
      />
      <chip
        footprint="soic8"
        name="U3"
        pcbX={8}
        pcbY={8}
        cadModel={{
          glbUrl: "https://modelcdn.tscircuit.com/jscad_models/soic8.glb",
        }}
      />
      <chip
        footprint="soic8"
        name="U4"
        pcbX={-8}
        pcbY={0}
        showAsTranslucentModel
        cadModel={{
          glbUrl: "https://modelcdn.tscircuit.com/jscad_models/soic8.glb",
        }}
      />
      <chip
        footprint="soic8"
        name="U5"
        pcbX={0}
        pcbY={0}
        cadModel={{
          glbUrl: "https://modelcdn.tscircuit.com/jscad_models/soic8.glb",
        }}
      />
      <chip
        footprint="soic8"
        name="U6"
        pcbX={8}
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
    "multiple-translucent-glb-models",
  )
})
