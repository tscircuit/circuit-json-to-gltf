import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import type { CircuitJson } from "circuit-json"
import {
  createSceneFromGLTF,
  loadGLTFWithResourcesFromURL,
  renderGLTFToPNGFromGLB,
} from "poppygl"
import { Circuit } from "tscircuit"
import { convertCircuitJsonToGltf } from "../../lib"

const toGlbDataUrl = (glb: ArrayBuffer) =>
  `data:model/gltf-binary;base64,${Buffer.from(glb).toString("base64")}`

const toGltfDataUrl = (gltf: object) =>
  `data:model/gltf+json;base64,${Buffer.from(JSON.stringify(gltf)).toString("base64")}`

const readSceneFromGlb = async (glb: ArrayBuffer) => {
  const { gltf, resources } = await loadGLTFWithResourcesFromURL(
    toGlbDataUrl(glb),
  )
  return { gltf, scene: createSceneFromGLTF(gltf, resources) }
}

test("reimporting an exported PCB GLB and glTF preserves top and bottom surface textures and UVs", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width={48} height={28} solderMaskColor="blue">
      <resistor
        name="R1"
        resistance="1k"
        footprint="0805"
        pcbX={-14}
        cadModel={null}
      />
      <resistor
        name="R2"
        resistance="1k"
        footprint="0603"
        pcbX={14}
        cadModel={null}
      />
      <trace from="R1.pin2" to="R2.pin1" pcbPath={["R1.pin2", "R2.pin1"]} />
      <silkscreentext text="TOP PANEL" pcbY={8} fontSize={2} />
      <silkscreentext
        text="BOTTOM PANEL"
        pcbY={-8}
        fontSize={1.5}
        layer="bottom"
      />
    </board>,
  )
  await circuit.renderUntilSettled()
  const pcbJson = circuit.getCircuitJson()

  const originalGlb = await convertCircuitJsonToGltf(pcbJson, {
    format: "glb",
    boardTextureResolution: 256,
  })
  expect(originalGlb).toBeInstanceOf(ArrayBuffer)

  const originalGltf = await convertCircuitJsonToGltf(pcbJson, {
    format: "gltf",
    boardTextureResolution: 256,
  })
  expect(typeof originalGltf).toBe("object")

  const source = await readSceneFromGlb(originalGlb as ArrayBuffer)
  expect(
    source.scene.drawCalls.filter((call) => call.material.baseColorTexture),
  ).toHaveLength(2)

  for (const modelField of [
    { model_glb_url: toGlbDataUrl(originalGlb as ArrayBuffer) },
    { model_gltf_url: toGltfDataUrl(originalGltf as object) },
  ]) {
    const assembly: CircuitJson = [
      {
        type: "source_component",
        source_component_id: "panel_source",
        name: "PANEL_BOARD",
        ftype: "simple_chip",
      },
      {
        type: "cad_component",
        cad_component_id: "panel_cad",
        source_component_id: "panel_source",
        anchor_alignment: "center",
        model_object_fit: "contain_within_bounds",
        ...modelField,
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 90, y: 180, z: 0 },
        model_origin_position: { x: 0, y: 0, z: 0 },
      },
    ]

    const reimportedGlb = await convertCircuitJsonToGltf(assembly, {
      format: "glb",
    })
    expect(reimportedGlb).toBeInstanceOf(ArrayBuffer)

    const reimported = await readSceneFromGlb(reimportedGlb as ArrayBuffer)
    const texturedDrawCalls = reimported.scene.drawCalls.filter(
      (call) => call.material.baseColorTexture,
    )
    expect(texturedDrawCalls).toHaveLength(2)
    expect(reimported.gltf.textures).toHaveLength(2)
    expect(reimported.gltf.images).toHaveLength(2)

    for (const call of texturedDrawCalls) {
      expect(call.material.baseColorFactor).toEqual([1, 1, 1, 1])
      expect(call.uvs).not.toBeNull()
      expect(call.uvs!.length).toBeGreaterThan(0)
    }

    const renderedOriginalPng = await renderGLTFToPNGFromGLB(
      originalGlb as ArrayBuffer,
      {
        width: 240,
        height: 180,
        camPos: [0, 55, 1],
        lookAt: [0, 0, 0],
        fov: 40,
        backgroundColor: "#ffffff",
      },
    )
    const renderedReimportedPng = await renderGLTFToPNGFromGLB(
      reimportedGlb as ArrayBuffer,
      {
        width: 240,
        height: 180,
        camPos: [0, 55, 1],
        lookAt: [0, 0, 0],
        fov: 40,
        backgroundColor: "#ffffff",
      },
    )
    const countBlueSolderMaskPixels = async (png: Uint8Array | ArrayBuffer) => {
      const img = await loadImage(Buffer.from(png as Uint8Array))
      const canvas = createCanvas(img.width, img.height)
      const ctx = canvas.getContext("2d")
      ctx.drawImage(img, 0, 0)
      const { data } = ctx.getImageData(0, 0, img.width, img.height)
      let bluePixels = 0
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]!
        const g = data[i + 1]!
        const b = data[i + 2]!
        if (b > 90 && b > r * 1.8 && b > g * 1.2) {
          bluePixels++
        }
      }
      return bluePixels
    }
    const originalBluePixels =
      await countBlueSolderMaskPixels(renderedOriginalPng)
    const reimportedBluePixels = await countBlueSolderMaskPixels(
      renderedReimportedPng,
    )
    expect(originalBluePixels).toBeGreaterThan(2000)
    expect(reimportedBluePixels).toBeGreaterThan(originalBluePixels * 0.85)
  }
}, 30_000)
