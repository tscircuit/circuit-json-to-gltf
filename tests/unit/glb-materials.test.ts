import { test, expect } from "bun:test"
import { loadGLB } from "../../lib"

function encodeText(str: string): Uint8Array {
  return new TextEncoder().encode(str)
}

function createMinimalGLBWithMaterials(): ArrayBuffer {
  // Build minimal glTF JSON with only materials
  const gltf = {
    asset: { version: "2.0", generator: "unit-test" },
    materials: [
      {
        name: "Red",
        pbrMetallicRoughness: {
          baseColorFactor: [1, 0, 0, 0.7],
        },
      },
      {
        name: "Green",
        pbrMetallicRoughness: {
          baseColorFactor: [0, 1, 0, 1],
        },
      },
    ],
  }

  const jsonString = JSON.stringify(gltf)
  const jsonData = encodeText(jsonString)

  // Pad JSON to 4-byte alignment with spaces (0x20)
  const jsonPadding = (4 - (jsonData.length % 4)) % 4
  const jsonLength = jsonData.length + jsonPadding

  const totalLength = 12 /*header*/ + 8 /*json chunk header*/ + jsonLength

  const buffer = new ArrayBuffer(totalLength)
  const view = new DataView(buffer)

  // Header
  view.setUint32(0, 0x46546c67, true) // magic "glTF"
  view.setUint32(4, 2, true) // version
  view.setUint32(8, totalLength, true) // total length

  // JSON chunk header
  view.setUint32(12, jsonLength, true) // chunk length
  view.setUint32(16, 0x4e4f534a, true) // chunk type "JSON"

  // JSON chunk data with padding
  const jsonArray = new Uint8Array(buffer, 20, jsonLength)
  jsonArray.set(jsonData)
  for (let i = jsonData.length; i < jsonLength; i++) {
    jsonArray[i] = 0x20
  }

  return buffer
}

test("GLB loader parses materials and mapping from baseColorFactor", async () => {
  const glbBuffer = createMinimalGLBWithMaterials()

  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () =>
    new Response(new Uint8Array(glbBuffer))) as any

  try {
    const mesh = await loadGLB("https://example.com/test.glb")

    // Should expose OBJ-like materials when GLB defines them
    // @ts-ignore runtime type guard for test
    expect(!!(mesh as any).materials).toBeTrue()
    // @ts-ignore
    const materials: Map<string, any> = (mesh as any).materials
    // @ts-ignore
    const materialIndexMap: Map<string, number> = (mesh as any).materialIndexMap

    expect(materials.size).toBe(2)
    expect(materialIndexMap.get("Red")).toBe(0)
    expect(materialIndexMap.get("Green")).toBe(1)

    const red = materials.get("Red")
    const green = materials.get("Green")

    expect(red.color).toEqual([255, 0, 0, 1])
    // dissolve = 1 - alpha (alpha=0.7) => 0.3
    expect(red.dissolve).toBeCloseTo(0.3)

    expect(green.color).toEqual([0, 255, 0, 1])
    expect(green.dissolve).toBeCloseTo(0.0)

    // No meshes in this minimal GLB, triangles should be empty
    expect(mesh.triangles.length).toBe(0)
  } finally {
    globalThis.fetch = originalFetch as any
  }
})
