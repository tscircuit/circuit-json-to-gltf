import { test, expect } from "bun:test"
import { readFileSync } from "node:fs"
import { join, resolve as resolvePath } from "node:path"
import { pathToFileURL } from "node:url"

import { convertCircuitJsonToGltf } from "../../lib/index"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"

const simpleCircuitPath = join(import.meta.dir, "../fixtures/simple-circuit.json")
const baseCircuit = JSON.parse(
  readFileSync(simpleCircuitPath, "utf-8"),
) as CircuitJson

const soicModelUrl = pathToFileURL(
  resolvePath(import.meta.dir, "../fixtures/models/soic8.glb"),
).href

test("merges multiple GLTF cad components into final scene", async () => {
  const circuit: CircuitJson = JSON.parse(JSON.stringify(baseCircuit))

  circuit.push(
    {
      type: "cad_component",
      cad_component_id: "cad_component_gltf_a",
      pcb_component_id: "comp1",
      source_component_id: "src1",
      model_gltf_url: soicModelUrl,
      position: { x: -10, y: 0, z: 1.6 },
      rotation: { x: 0, y: 0, z: 0 },
    } as any,
    {
      type: "cad_component",
      cad_component_id: "cad_component_gltf_b",
      pcb_component_id: "comp2",
      source_component_id: "src2",
      model_gltf_url: soicModelUrl,
      position: { x: 12, y: 0, z: 1.6 },
      rotation: { x: 0, y: 0, z: 90 },
    } as any,
  )

  const scene3D = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })

  expect(scene3D.externalModels?.length).toBe(2)

  const glbResult = (await convertCircuitJsonToGltf(circuit, {
    format: "glb",
    boardTextureResolution: 0,
  })) as ArrayBuffer

  expect(glbResult).toBeInstanceOf(ArrayBuffer)
  expect(glbResult.byteLength).toBeGreaterThan(0)

  const pngBuffer = await renderGLTFToPNGBufferFromGLBBuffer(glbResult)
  await expect(pngBuffer).toMatchPngSnapshot(
    import.meta.path,
    "multiple-cad-components",
  )

  const gltfResult = (await convertCircuitJsonToGltf(circuit, {
    format: "gltf",
    boardTextureResolution: 0,
  })) as any

  expect(Array.isArray(gltfResult.nodes)).toBe(true)
  expect(
    gltfResult.nodes.some((node: any) =>
      typeof node?.name === "string" &&
      (node.name.includes("cad_component_gltf_a") ||
        node.name.includes("src1")),
    ),
  ).toBe(true)
  expect(
    gltfResult.nodes.some((node: any) =>
      typeof node?.name === "string" &&
      (node.name.includes("cad_component_gltf_b") ||
        node.name.includes("src2")),
    ),
  ).toBe(true)
})
