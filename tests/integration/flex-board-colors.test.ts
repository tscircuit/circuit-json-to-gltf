import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { createSceneFromGLTF, loadGLTFWithResourcesFromURL } from "poppygl"
import {
  convertCircuitJsonToGltf,
  convertCircuitJsonTo3D,
  convertSceneToGLTF,
} from "../../lib"
import type { Color } from "../../lib"
import {
  convertCircuitJsonTo3D as convertBrowserScene,
  convertCircuitJsonToGltf as convertBrowserGltf,
} from "../../lib/browser"
import { convertCircuitJsonToGltf as convertBrowserIndexGltf } from "../../lib/browser-index"

const createBoard = (solderMaskColor?: string): CircuitJson => [
  {
    type: "pcb_board",
    pcb_board_id: "flex_board",
    center: { x: 0, y: 0 },
    width: 20,
    height: 10,
    thickness: 0.12,
    num_layers: 2,
    material: "flex",
    solder_mask_color: solderMaskColor,
  },
]

const loadExport = async (glb: ArrayBuffer | object) => {
  expect(glb).toBeInstanceOf(ArrayBuffer)
  const { gltf, resources } = await loadGLTFWithResourcesFromURL(
    `data:model/gltf-binary;base64,${Buffer.from(glb as ArrayBuffer).toString("base64")}`,
  )
  return createSceneFromGLTF(gltf, resources).drawCalls
}

test("default flex GLB has amber top/bottom textures and polyimide edges", async () => {
  const input = createBoard()
  const original = structuredClone(input)
  const drawCalls = await loadExport(
    await convertCircuitJsonToGltf(input, {
      format: "glb",
      boardTextureResolution: 64,
    }),
  )
  const textured = drawCalls.filter((call) => call.material.baseColorTexture)
  expect(textured).toHaveLength(2)
  for (const call of textured) {
    const image = call.material.baseColorTexture!
    const offset =
      (Math.floor(image.height / 2) * image.width +
        Math.floor(image.width / 2)) *
      4
    expect([...image.data.slice(offset, offset + 4)]).toEqual([
      204, 156, 51, 255,
    ])
  }
  const edges = drawCalls.filter((call) => !call.material.baseColorTexture)
  expect(edges).toHaveLength(1)
  expect(edges[0]!.material.baseColorFactor).toEqual([
    204 / 255,
    156 / 255,
    51 / 255,
    1,
  ])
  expect(input).toEqual(original)
})

test("textureless native and no-bend browser GLB faces use the flex material", async () => {
  for (const convert of [
    convertCircuitJsonToGltf,
    convertBrowserGltf,
    convertBrowserIndexGltf,
  ]) {
    const drawCalls = await loadExport(
      await convert(createBoard(), {
        format: "glb",
        boardTextureResolution: 0,
      }),
    )
    expect(drawCalls).toHaveLength(1)
    expect(drawCalls[0]!.material.baseColorTexture).toBeNull()
    expect(drawCalls[0]!.material.baseColorFactor).toEqual([
      204 / 255,
      156 / 255,
      51 / 255,
      1,
    ])
  }
  const browser = await convertBrowserScene(createBoard())
  const native = await convertCircuitJsonTo3D(createBoard(), {
    renderBoardTextures: false,
  })
  expect(browser).toEqual(native)
})

test("explicit flex mask and public background overrides win in native and browser exports", async () => {
  for (const convert of [
    convertCircuitJsonToGltf,
    convertBrowserGltf,
    convertBrowserIndexGltf,
  ]) {
    for (const backgroundColor of [undefined, "#123456"]) {
      const calls = await loadExport(
        await convert(createBoard("#aeb8c6"), {
          format: "glb",
          boardTextureResolution: 0,
          backgroundColor,
        }),
      )
      const rgb: [number, number, number] = backgroundColor
        ? [18, 52, 86]
        : [174, 184, 198]
      expect(calls[0]!.material.baseColorFactor).toEqual([
        rgb[0] / 255,
        rgb[1] / 255,
        rgb[2] / 255,
        1,
      ])
    }
  }
  const native = await convertCircuitJsonTo3D(createBoard(), {
    pcbColor: "#123456",
    boardSideColor: "#445566",
    renderBoardTextures: false,
  })
  expect(native.boxes[0]!.color).toBe("#123456")
  expect(native.boxes[0]!.sideColor).toBe("#445566")
})

test("empty and not_specified public background options keep the default flex palette", async () => {
  for (const convert of [
    convertCircuitJsonToGltf,
    convertBrowserGltf,
    convertBrowserIndexGltf,
  ]) {
    for (const backgroundColor of ["not_specified", "", " "]) {
      const calls = await loadExport(
        await convert(createBoard(), {
          format: "glb",
          boardTextureResolution: 0,
          backgroundColor,
        }),
      )
      expect(calls[0]!.material.baseColorFactor).toEqual([
        204 / 255,
        156 / 255,
        51 / 255,
        1,
      ])
    }
  }
})

test("real RGBA and tuple options retain their original value and alpha", async () => {
  const colors: Color[] = ["rgba(18,52,86,0.35)", [18, 52, 86, 0.35]]
  for (const color of colors) {
    const scene = await convertCircuitJsonTo3D(createBoard(), {
      renderBoardTextures: false,
      pcbColor: color,
    })
    expect(scene.boxes[0]!.color).toEqual(color)
    const calls = await loadExport(
      typeof color === "string"
        ? await convertCircuitJsonToGltf(createBoard(), {
            format: "glb",
            boardTextureResolution: 0,
            backgroundColor: color,
          })
        : await convertSceneToGLTF(scene, { binary: true }),
    )
    expect(calls[0]!.material.baseColorFactor).toEqual([
      18 / 255,
      52 / 255,
      86 / 255,
      0.35,
    ])
  }
})
