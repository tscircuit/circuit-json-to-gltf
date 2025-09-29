import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../lib"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import simpleCircuit from "./fixtures/simple-circuit.json"
import "./fixtures/png-matcher"

test("PNG snapshot of rendered GLTF", async () => {
  const result = await convertCircuitJsonToGltf(simpleCircuit as any, {
    format: "glb",
  })

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(result as ArrayBuffer),
  ).toMatchPngSnapshot(import.meta.path)
})
