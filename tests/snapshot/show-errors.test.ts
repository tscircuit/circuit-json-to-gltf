import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import type { CircuitJsonWithPcbFlex } from "../../lib/types"
import { createCircuitJsonErrors } from "../fixtures/circuit-json-errors"
import {
  createBendZoneFlex,
  createNonparallelFlex,
} from "../fixtures/invalid-flex"

test("Circuit JSON errors remain readable inside translated and invalid-flex GLB scenes", async () => {
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
    const scene = await convertCircuitJsonTo3D(input, {
      showErrors: true,
      foldPcbs: true,
      renderBoardTextures: false,
    })
    const target = scene.camera!.target
    // Frame both real circuit geometry and its annotation in exported glTF,
    // +Y up, mm. X uses the same canonical mirror as the exported board.
    const diagonal = Math.hypot(
      scene.camera!.position.x - target.x,
      scene.camera!.position.y - target.y,
      scene.camera!.position.z - target.z,
    )
    const glb = await convertCircuitJsonToGltf(input, {
      format: "glb",
      showErrors: true,
      foldPcbs: true,
      boardTextureResolution: 1024,
    })
    const png = await renderGLTFToPNGFromGLB(glb as ArrayBuffer, {
      width: tileWidth,
      height: tileHeight - heading,
      camPos: [
        -target.x + diagonal * 0.08,
        target.y + diagonal * 0.65,
        target.z - diagonal * 0.3,
      ],
      lookAt: [-target.x, target.y, target.z],
      up: "y+",
      fov: 42,
      backgroundColor: "#f2f3f5",
      ambient: 0.6,
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
