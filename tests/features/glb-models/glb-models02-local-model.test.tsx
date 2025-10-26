import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../../lib"
import { getBestCameraPosition } from "../../../lib/utils/camera-position"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import dip4ModelUrl from "./assets/dip4.glb"

test("glb-models02-local-model", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="25" height="25">
      <chip
        footprint="dip4"
        name="U1"
        cadModel={{
          glbUrl: dip4ModelUrl,
        }}
      />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
  })

  const cameraOptions = getBestCameraPosition(circuitJson)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glb as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path)
})
