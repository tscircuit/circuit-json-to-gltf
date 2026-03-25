import { test, expect } from "bun:test"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import type { CircuitJson } from "circuit-json"
import * as fs from "node:fs"
import * as path from "node:path"

test("arduino-uno-pcb-snapshot", async () => {
  const fixturePath = path.join(
    __dirname,
    "../fixtures/arduino-uno.circuit.json",
  )
  const circuitData = fs.readFileSync(fixturePath, "utf-8")
  const circuitJson: CircuitJson = JSON.parse(circuitData)

  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 1024,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  const cameraOptions = getBestCameraPosition(circuitJson)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glbResult as ArrayBuffer, {
      ...cameraOptions,
      width: 2048,
      height: 1536,
      supersampling: 2,
    }),
  ).toMatchPngSnapshot(import.meta.path, "arduino-uno")
}, 30_000)
