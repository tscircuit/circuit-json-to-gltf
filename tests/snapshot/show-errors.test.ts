import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import type { CircuitJsonWithPcbFlex } from "../../lib/types"
import { createCircuitJsonErrors } from "../fixtures/circuit-json-errors"
import {
  createBendZoneFlex,
  createNonparallelFlex,
} from "../fixtures/invalid-flex"

test("Circuit JSON errors appear as screen overlays in translated and invalid-flex GLB scenes", async () => {
  const nonparallel = createNonparallelFlex()
  const bendZone = createBendZoneFlex(true)
  for (const [input, message] of [
    [
      nonparallel,
      "Unable to fold PCB board flex_board; CAD remains flat: PCB bending requires parallel bend lines.",
    ],
    [
      bendZone,
      "Unable to fold CAD for PCB component pcb_R1; CAD remains flat: the rigid mount lies inside bend zone bend_zone.",
    ],
  ] as const) {
    input.push({
      type: "pcb_placement_error",
      pcb_placement_error_id: "placement_error",
      error_type: "pcb_placement_error",
      message,
    })
  }
  const inputs: CircuitJsonWithPcbFlex[] = [
    createCircuitJsonErrors(),
    nonparallel,
    bendZone,
  ]
  const tileWidth = 820
  const tileHeight = 760
  const heading = 42
  const canvas = createCanvas(tileWidth * inputs.length, tileHeight)
  const context = canvas.getContext("2d")
  context.fillStyle = "#f2f3f5"
  context.fillRect(0, 0, canvas.width, canvas.height)
  for (const [index, input] of inputs.entries()) {
    const glb = await convertCircuitJsonToGltf(input, {
      format: "glb",
      showErrors: true,
      foldPcbs: true,
      boardTextureResolution: 1024,
    })
    const png = await renderGLTFToPNGFromGLB(glb as ArrayBuffer, {
      width: tileWidth,
      height: tileHeight - heading,
      // Exported glTF (+Y up, mm): preserve each circuit's normal camera.
      // Only PoppyGL draws the screen overlay embedded in the GLB metadata.
      camPos:
        index === 0
          ? [-50, 42, -118]
          : index === 1
            ? [70, 65, -70]
            : [-50, 42, -48],
      lookAt:
        index === 0 ? [-100, 0, -70] : index === 1 ? [-8, 0, 7] : [0, 7, 0],
      up: "y+",
      fov: 35,
      backgroundColor: "#f2f3f5",
      ambient: 0.45,
    })
    context.drawImage(await loadImage(png), index * tileWidth, heading)
    context.fillStyle = "#28323c"
    context.font = "20px sans-serif"
    context.fillText(
      [
        "Translated board: PCB and unlocated source errors",
        "Nonparallel bends: visible placement error",
        "Bend-zone mount: error and folded valid geometry",
      ][index]!,
      index * tileWidth + 16,
      28,
    )
  }
  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
  )
})
