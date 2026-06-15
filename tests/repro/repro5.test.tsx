import { test, expect } from "bun:test"
import { renderGlbToPng } from "../helpers"
import { convertCircuitJsonToGltf } from "../../lib/index"
import type { CircuitJson } from "circuit-json"
import * as fs from "node:fs"
import * as path from "node:path"

test("CAD model Z-coordinate position offset issue", async () => {
  const c919627Path = path.join(__dirname, "../fixtures/C919627.json")

  const circuitData = fs.readFileSync(c919627Path, "utf-8")
  const circuitJson: CircuitJson = JSON.parse(circuitData)

  // Convert circuit to GLTF (GLB format for rendering)
  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 1024,
    includeModels: true,
    showBoundingBoxes: true,
  })

  // Ensure we got a valid GLB buffer
  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  // Render the GLB to PNG with camera position derived from circuit dimensions

  expect(
    renderGlbToPng(glbResult as ArrayBuffer, circuitJson),
  ).toMatchPngSnapshot(import.meta.path, "repro5")
})
