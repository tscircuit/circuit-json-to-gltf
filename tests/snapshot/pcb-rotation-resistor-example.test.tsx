import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import { Circuit } from "tscircuit"
import type { CircuitJson } from "circuit-json"

test("pcb rotation top-bottom resistor example with dual 3d views", async () => {
  // Create circuit using tscircuit JSX syntax
  const circuit = new Circuit()

  circuit.add(
    <board width={12} height={4}>
      <resistor
        name="R1"
        pcbRotation="45deg"
        pcbX={-3}
        footprint="0402"
        resistance="1k"
      />
      <resistor
        name="R2"
        pcbX={3}
        footprint="0402"
        resistance="1k"
        pcbRotation="45deg"
        layer="bottom"
      />
    </board>,
  )

  circuit.render()
  const circuitJson = circuit.getCircuitJson()

  // Test 1: Top view (default camera angle)
  const glbResult = await convertCircuitJsonToGltf(circuitJson as CircuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  const cameraOptions = getBestCameraPosition(circuitJson as CircuitJson)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path, "pcb-rotation-resistor-example-top")

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, {
      camPos: [15, -15, 15],
    }),
  ).toMatchPngSnapshot(import.meta.path, "pcb-rotation-resistor-example-bottom")
})
