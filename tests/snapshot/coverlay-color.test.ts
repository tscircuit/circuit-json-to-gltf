import { expect, test } from "bun:test"
import { convertCircuitJsonToGltf, getBestCameraPosition } from "../../lib"
import { renderGLTFToPNGFromGLB } from "poppygl"
import type { CircuitJson } from "circuit-json"
import { createCoverlayCircuit } from "../fixtures/coverlay-circuit"

async function renderCircuit(circuit: CircuitJson) {
  const glb = await convertCircuitJsonToGltf(circuit, {
    format: "glb",
    boardTextureResolution: 512,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
  return renderGLTFToPNGFromGLB(glb, {
    ...getBestCameraPosition(circuit),
    width: 600,
    height: 400,
    backgroundColor: "#eeeeee",
    supersampling: 2,
  })
}

test("yellow flex coverlay reaches the exported 3D model", async () => {
  const png = await renderCircuit(createCoverlayCircuit("yellow"))
  await expect(png).toMatchPngSnapshot(import.meta.path, "yellow")
})

test("black flex coverlay reaches the exported 3D model", async () => {
  const png = await renderCircuit(createCoverlayCircuit("black"))
  await expect(png).toMatchPngSnapshot(import.meta.path, "black")
})

test("white flex coverlay reaches the exported 3D model", async () => {
  const png = await renderCircuit(createCoverlayCircuit("white"))
  await expect(png).toMatchPngSnapshot(import.meta.path, "white")
})
