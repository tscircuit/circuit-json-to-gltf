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

  const bottomCadComponent = circuitJson.find(
    (item) => item.type === "cad_component" && item.position.z < 0,
  )!
  // bottomCadComponent.position.z = -1.5
  // bottomCadComponent.rotation.z = 45
  // bottomCadComponent.rotation.y = 0

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

  console.log(circuitJson.filter((item) => item.type === "cad_component"))

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, {
      camPos: [8, -8, 8],
    }),
  ).toMatchPngSnapshot(import.meta.path, "pcb-rotation-resistor-example-bottom")
})
