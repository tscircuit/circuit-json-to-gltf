import { test, expect } from "bun:test"
import { renderGlbToPng } from "../../helpers"
import { convertCircuitJsonToGltf } from "../../../lib/index"
import type { CircuitJson } from "circuit-json"
import * as fs from "node:fs"
import * as path from "node:path"

test("jlcpcb-cad-model-pcb-snapshot", async () => {
  // Load the JLCPCB CAD model circuit JSON
  const jlcpcbCadModelPath = path.join(__dirname, "jlcpcb-cad-model.json")

  const circuitData = fs.readFileSync(jlcpcbCadModelPath, "utf-8")
  const circuitJson: CircuitJson = JSON.parse(circuitData)

  // Convert circuit to GLTF (GLB format for rendering)
  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 1024,
    includeModels: true,
    showBoundingBoxes: false,
    backgroundColor: "#000000",
  })

  // Bun.write("jlcpcb-cad-model.glb", Buffer.from(glbResult as ArrayBuffer))

  // Ensure we got a valid GLB buffer
  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  // Render the GLB to PNG with camera position derived from circuit dimensions

  expect(
    renderGlbToPng(glbResult as ArrayBuffer, circuitJson),
  ).toMatchPngSnapshot(import.meta.path)
})
