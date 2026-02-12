import { Circuit } from "tscircuit"
import type { CircuitJson } from "circuit-json"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"

test("faux-board-snapshot", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="10mm" height="10mm">
      <chip footprint="soic8" name="U1" />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()
  const circuitJsonWithoutBoard = circuitJson.filter(
    (element) => element.type !== "pcb_board",
  ) as CircuitJson

  const glb = await convertCircuitJsonToGltf(circuitJsonWithoutBoard, {
    format: "glb",
    drawFauxBoard: true,
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)
  expect(
    circuitJsonWithoutBoard.some((element) => element.type === "pcb_board"),
  ).toBe(false)

  const firstPcbComponent = circuitJsonWithoutBoard.find(
    (element) => element.type === "pcb_component",
  ) as { center?: { x?: number; y?: number } } | undefined

  const centerX = firstPcbComponent?.center?.x ?? 0
  const centerY = firstPcbComponent?.center?.y ?? 0

  const cameraOptions = {
    camPos: [centerX + 6, 7, centerY + 6] as const,
    lookAt: [centerX, 0, centerY] as const,
  }

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glb as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path)
})
