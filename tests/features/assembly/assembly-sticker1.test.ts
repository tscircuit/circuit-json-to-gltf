import { expect, test } from "bun:test"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../../lib"
import {
  createNema17EnclosureWithSticker,
  enclosureStickerCamera,
} from "../../fixtures/nema17-enclosure-sticker"

test("renders the proposed cad_sticker as a printed label on the NEMA17 enclosure lid", async () => {
  const glb = await convertCircuitJsonToGltf(
    await createNema17EnclosureWithSticker(),
    { format: "glb" },
  )
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary glTF")
  await expect(
    renderGLTFToPNGFromGLB(glb, enclosureStickerCamera),
  ).toMatchPngSnapshot(import.meta.path)
})
