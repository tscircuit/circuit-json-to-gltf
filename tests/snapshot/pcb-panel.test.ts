import { test, expect } from "bun:test"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib/index"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import type { CircuitJson } from "circuit-json"
import circuitJsonFixture from "../fixtures/panel.json"

test("pcb-panel-snapshot", async () => {
  const circuitJson: CircuitJson = circuitJsonFixture as CircuitJson

  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: false,
    showBoundingBoxes: false,
  })

  const cameraOptions = getBestCameraPosition(circuitJson)
  const rotatedCameraOptions = {
    camPos: [
      -cameraOptions.camPos[0],
      cameraOptions.camPos[1],
      -cameraOptions.camPos[2],
    ] as const,
    lookAt: [
      -cameraOptions.lookAt[0],
      cameraOptions.lookAt[1],
      -cameraOptions.lookAt[2],
    ] as const,
  }

  expect(
    renderGLTFToPNGFromGLB(glbResult as ArrayBuffer, rotatedCameraOptions),
  ).toMatchPngSnapshot(import.meta.path)
}, 20000)
