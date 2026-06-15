import { test, expect } from "bun:test"
import { renderGlbToPng } from "../helpers"
import { convertCircuitJsonToGltf } from "../../lib/index"
import * as fs from "node:fs"
import * as path from "node:path"
import type { CircuitJson } from "circuit-json"

test("gltf-url-component-snapshot", async () => {
  // Load the fixture
  const fixturePath = path.join(
    __dirname,
    "../fixtures/circuit-with-gltf-url.json",
  )

  const circuitData = fs.readFileSync(fixturePath, "utf-8")
  const circuitJson: CircuitJson = JSON.parse(circuitData)

  // Convert circuit to GLTF (GLB format for rendering)
  const glbResult = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
  })

  // Ensure we got a valid GLB buffer
  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  expect(
    renderGlbToPng(glbResult as ArrayBuffer, circuitJson),
  ).toMatchPngSnapshot(import.meta.path)
})
