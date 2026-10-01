import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { Circuit } from "tscircuit"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import {
  createDaughtercard,
  createDaughtercardCarrier,
} from "../fixtures/upright-daughtercard-rotation"

// Nested GLB loading keeps material factors but does not sample the embedded
// board texture, so set explicit colors for this review-facing comparison.
const recolorDaughtercardGlb = (glb: ArrayBuffer) => {
  const view = new DataView(glb)
  const jsonLength = view.getUint32(12, true)
  const jsonStart = 20
  const binaryChunkStart = jsonStart + jsonLength
  const document = JSON.parse(
    new TextDecoder().decode(new Uint8Array(glb, jsonStart, jsonLength)),
  )

  const materialIndexesForMesh = (meshName: string) =>
    new Set<number>(
      document.meshes
        ?.find((mesh: { name?: string }) => mesh.name === meshName)
        ?.primitives.map(
          (primitive: { material?: number }) => primitive.material,
        )
        .filter((material: number | undefined) => material !== undefined) ?? [],
    )
  const boardMaterialIndexes = materialIndexesForMesh("MeshWithTextures0")
  const edgeContactMaterialIndexes = materialIndexesForMesh("EDGE1")

  for (const [materialIndex, material] of (
    document.materials ?? []
  ).entries()) {
    const pbr = material.pbrMetallicRoughness
    if (!pbr) continue
    if (boardMaterialIndexes.has(materialIndex)) {
      pbr.baseColorFactor = [0.04, 0.22, 0.78, 1]
    } else if (edgeContactMaterialIndexes.has(materialIndex)) {
      pbr.baseColorFactor = [0.95, 0.68, 0.08, 1]
      material.alphaMode = "OPAQUE"
    }
  }

  const json = new TextEncoder().encode(JSON.stringify(document))
  const paddedJsonLength = Math.ceil(json.length / 4) * 4
  const binaryChunk = new Uint8Array(glb, binaryChunkStart)
  const result = new ArrayBuffer(20 + paddedJsonLength + binaryChunk.length)
  const resultView = new DataView(result)
  resultView.setUint32(0, 0x46546c67, true)
  resultView.setUint32(4, 2, true)
  resultView.setUint32(8, result.byteLength, true)
  resultView.setUint32(12, paddedJsonLength, true)
  resultView.setUint32(16, 0x4e4f534a, true)
  const resultBytes = new Uint8Array(result)
  resultBytes.fill(0x20, jsonStart, jsonStart + paddedJsonLength)
  resultBytes.set(json, jsonStart)
  resultBytes.set(binaryChunk, jsonStart + paddedJsonLength)
  return result
}

test("captures the current +90 degree project Y daughtercard rotation", async () => {
  const daughter = new Circuit()
  daughter.add(createDaughtercard())
  await daughter.renderUntilSettled()
  const daughterGlb = await convertCircuitJsonToGltf(
    daughter.getCircuitJson(),
    {
      format: "glb",
      boardTextureResolution: 256,
    },
  )
  if (!(daughterGlb instanceof ArrayBuffer))
    throw new Error("Expected daughtercard GLB")
  const coloredDaughterGlb = recolorDaughtercardGlb(daughterGlb)
  const daughtercardGlbUrl = `data:model/gltf-binary;base64,${Buffer.from(coloredDaughterGlb).toString("base64")}`

  const circuit = new Circuit()
  circuit.add(createDaughtercardCarrier({ daughtercardGlbUrl, rotationY: 90 }))
  await circuit.renderUntilSettled()
  const afterGlb = await convertCircuitJsonToGltf(circuit.getCircuitJson(), {
    format: "glb",
    boardTextureResolution: 256,
  })
  if (!(afterGlb instanceof ArrayBuffer))
    throw new Error("Expected assembly GLB")
  const bounds = boundsOfTriangles(
    parseGLB(afterGlb, COORDINATE_TRANSFORMS.IDENTITY).triangles,
  )
  // Characterize the current exporter behavior before correcting its direction.
  expect(bounds.max.y).toBeCloseTo(6.2, 5)
  expect(bounds.min.y).toBeCloseTo(-20.461, 5)

  const panelWidth = 720
  const panelHeight = 680
  const headingHeight = 54
  const canvas = createCanvas(panelWidth, panelHeight)
  const context = canvas.getContext("2d")
  context.fillStyle = "#f2f3f5"
  context.fillRect(0, 0, canvas.width, canvas.height)

  const png = await renderGLTFToPNGFromGLB(afterGlb, {
    width: panelWidth,
    height: panelHeight - headingHeight,
    camPos: [-50, 38, 56],
    lookAt: [0, 4, 0],
    up: "y+",
    ambient: 0.8,
    backgroundColor: "#f2f3f5",
  })
  context.drawImage(await loadImage(png), 0, headingHeight)
  context.fillStyle = "#b42318"
  context.font = "bold 20px sans-serif"
  context.fillText("Current bug: +90 degree Y points the card down", 20, 34)

  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
  )
}, 60_000)
