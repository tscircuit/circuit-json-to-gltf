import { Circuit } from "tscircuit"
import type { CircuitJson } from "circuit-json"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../../lib"
import { renderGlbToPng } from "../../renderGlbToPng"

test("models-from-footprint-strings-without-board", async () => {
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
  })

  const pngBuffer = await renderGlbToPng(
    glb as ArrayBuffer,
    circuitJsonWithoutBoard,
  )

  const normalizedBuffer = Buffer.isBuffer(pngBuffer)
    ? pngBuffer
    : Buffer.from(pngBuffer)

  expect(normalizedBuffer.length).toBeGreaterThan(0)
  expect(normalizedBuffer.toString("ascii", 1, 4)).toBe("PNG")
})
