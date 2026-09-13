import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import type { CircuitJson } from "circuit-json"
import {
  renderBoardLayer,
  renderBoardTextures,
} from "../../lib/converters/board-renderer"

const createCircuit = (solderMaskColor?: string): CircuitJson => [
  {
    type: "pcb_board",
    pcb_board_id: "board",
    center: { x: 0, y: 0 },
    width: 20,
    height: 10,
    thickness: 1.6,
    material: "fr4",
    num_layers: 2,
    solder_mask_color: solderMaskColor,
  },
  ...(["top", "bottom"] as const).flatMap((layer) =>
    [true, false].map((covered) => ({
      type: "pcb_copper_pour" as const,
      pcb_copper_pour_id: `${layer}-${covered}`,
      shape: "rect" as const,
      center: { x: covered ? -5 : 5, y: 0 },
      width: 4,
      height: 4,
      layer,
      covered_with_solder_mask: covered,
    })),
  ),
]

const pixels = async (uri: string) => {
  const image = await loadImage(uri)
  const canvas = createCanvas(image.width, image.height)
  const ctx = canvas.getContext("2d")
  ctx.drawImage(image, 0, 0)
  const at = (x: number, y: number) => [...ctx.getImageData(x, y, 1, 1).data]
  return { mask: at(200, 30), pours: [at(100, 100), at(300, 100)] }
}

test("default and explicit green textures use the viewer's subdued mask on both sides", async () => {
  for (const color of [undefined, "not_specified", "green"]) {
    const circuit = createCircuit(color)
    const textures = await renderBoardTextures(circuit, { resolution: 400 })
    for (const layer of ["top", "bottom"] as const) {
      const rendered = await pixels(textures[layer])
      expect(rendered.mask).toEqual([15, 79, 48, 255])
      // SVG pours composite translucent copper and mask over the substrate.
      // Check the rendered covered and exposed pixels, allowing either
      // ordering because a bottom texture may be mirrored.
      expect(rendered.pours).toContainEqual([35, 102, 61, 255])
      expect(rendered.pours).toContainEqual([228, 193, 106, 255])
      expect(
        await pixels(
          await renderBoardLayer(circuit, { layer, resolution: 400 }),
        ),
      ).toEqual(rendered)
    }
  }
})

test("explicit texture color overrides still control mask and copper separately", async () => {
  const textures = await renderBoardTextures(createCircuit(), {
    resolution: 400,
    backgroundColor: "#123456",
    solderMaskWithCopperColor: "#234567",
    copperColor: "#abcdef",
  })
  for (const uri of Object.values(textures)) {
    const rendered = await pixels(uri)
    expect(rendered.mask).toEqual([18, 52, 86, 255])
    expect(rendered.pours).toContainEqual([42, 75, 109, 255])
    expect(rendered.pours).toContainEqual([186, 184, 175, 255])
  }
})
