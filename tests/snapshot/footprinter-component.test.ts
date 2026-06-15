import { test, expect } from "bun:test"
import { renderGlbToPng } from "../helpers"
import { convertCircuitJsonToGltf } from "../../lib/index"
import * as fs from "node:fs"
import * as path from "node:path"
import type { CircuitJson } from "circuit-json"
import circuitJson from "../fixtures/circuit-with-footprinter.json"

test("footprinter-component-snapshot", async () => {
  const glbResult = await convertCircuitJsonToGltf(circuitJson as CircuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
  })

  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect((glbResult as ArrayBuffer).byteLength).toBeGreaterThan(0)

  expect(
    renderGlbToPng(glbResult as ArrayBuffer, circuitJson as CircuitJson),
  ).toMatchPngSnapshot(import.meta.path)
})
