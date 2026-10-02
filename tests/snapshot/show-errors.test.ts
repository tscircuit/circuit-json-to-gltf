import { expect, test } from "bun:test"
import { createCanvas, loadImage } from "@napi-rs/canvas"
import {
  buildCamera,
  createSceneFromGLTF,
  encodePNG,
  loadGLTFWithResourcesFromURL,
  renderSceneFromGLTF,
  resolveRenderOptions,
} from "poppygl"
import {
  convertCircuitJsonToGltf,
  getPoppyglErrorOverlayOptions,
} from "../../lib"
import type { CircuitJsonWithPcbFlex } from "../../lib/types"
import { createCircuitJsonErrors } from "../fixtures/circuit-json-errors"
import {
  createBendZoneFlex,
  createCrossingFlex,
} from "../fixtures/invalid-flex"

test("Circuit JSON errors appear as screen overlays in translated and invalid-flex GLB scenes", async () => {
  const crossing = createCrossingFlex()
  const bendZone = createBendZoneFlex(true)
  for (const [input, message] of [
    [
      crossing,
      "Unable to fold PCB board flex_board; CAD remains flat: Overlapping PCB bend zones or incompatible moving regions are not supported.",
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
    crossing,
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
    const { gltf, resources } = await loadGLTFWithResourcesFromURL(
      `data:model/gltf-binary;base64,${Buffer.from(glb as ArrayBuffer).toString("base64")}`,
    )
    const scene = createSceneFromGLTF(gltf, resources)
    const options = resolveRenderOptions({
      width: tileWidth,
      height: tileHeight - heading,
      // Exported glTF (+Y up, mm): preserve each circuit's normal camera.
      // The adapter only supplies stock PoppyGL debug labels, without changing
      // any geometry or camera values.
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
      debugFontSize: 20,
      debugLabelColor: [160, 0, 35],
      debugPointColor: [160, 0, 35],
    })
    const camera = buildCamera(
      scene.drawCalls,
      options.width * options.supersampling,
      options.height * options.supersampling,
      options.fov,
      options.camPos,
      options.lookAt,
      options.up,
      options.cameraRotation,
    )
    const overlay = getPoppyglErrorOverlayOptions(gltf, camera, {
      width: options.width,
      height: options.height,
      supersampling: options.supersampling,
      debugFontSize: options.debugFontSize ?? undefined,
    })
    expect(overlay).toBeDefined()
    const { bitmap } = renderSceneFromGLTF(scene, { ...options, ...overlay })
    const png = await encodePNG(bitmap)
    context.drawImage(await loadImage(png), index * tileWidth, heading)
    context.fillStyle = "#28323c"
    context.font = "20px sans-serif"
    context.fillText(
      [
        "Translated board: PCB and unlocated source errors",
        "Crossing bends: visible placement error",
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
