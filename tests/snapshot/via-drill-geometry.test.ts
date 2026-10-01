import { expect, test } from "bun:test"
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas"
import tscircuitFont from "@tscircuit/alphabet/base64font"
import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonTo3D, convertSceneToGLTF } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"

test("GLB surface mask covers tented sides while the substrate keeps every via drill", async () => {
  GlobalFonts.register(Buffer.from(tscircuitFont, "base64"), "ViaSnapshot")
  const circuit: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board",
      center: { x: 0, y: 0 },
      width: 20,
      height: 10,
      thickness: 1.6,
      material: "fr4",
      num_layers: 2,
    },
  ]
  const flags = [
    { tented_on_top: false, tented_on_bottom: false },
    { tented_on_top: true, tented_on_bottom: false },
    { tented_on_top: false, tented_on_bottom: true },
    { tented_on_top: true, tented_on_bottom: true },
  ]
  for (const [i, tenting] of flags.entries()) {
    const x = -7.5 + i * 5
    circuit.push(
      {
        type: "pcb_via",
        pcb_via_id: `via_${i}`,
        x,
        y: 2,
        hole_diameter: 1,
        outer_diameter: 2,
        layers: ["top", "bottom"],
        ...tenting,
      },
      {
        type: "pcb_trace",
        pcb_trace_id: `trace_${i}`,
        route: [
          {
            route_type: "via",
            x,
            y: -2,
            from_layer: "top",
            to_layer: "bottom",
            hole_diameter: 1,
            outer_diameter: 2,
            ...tenting,
          },
        ],
      },
    )
  }

  const width = 1000,
    height = 500,
    header = 100
  const canvas = createCanvas(width, (height + header) * 2)
  const ctx = canvas.getContext("2d")
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (const [row, renderBoardTextures] of [true, false].entries()) {
    const scene = await convertCircuitJsonTo3D(circuit, {
      renderBoardTextures,
      textureResolution: 1200,
    })
    const glb = await convertSceneToGLTF(scene, {
      binary: true,
      embedImages: true,
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB output")
    // Same +Y-up top view as via-tenting.test.ts; local PCB +Y maps to scene +Z.
    const camera = getBestCameraPosition(circuit, {
      direction: [0, 1, -1e-3],
      ortho: true,
      aspectRatio: width / height,
    })
    const png = await renderGLTFToPNGFromGLB(glb, {
      ...camera,
      width,
      height,
      backgroundColor: [1, 1, 1],
    })
    const y = row * (height + header)
    ctx.drawImage(await loadImage(png), 0, y + header)
    ctx.fillStyle = "#172c3b"
    ctx.font = "18px ViaSnapshot"
    ctx.fillText(
      renderBoardTextures
        ? "Top surface with soldermask"
        : "Textures disabled: all eight physical via drills remain",
      20,
      y + 25,
    )
    ctx.font = "16px ViaSnapshot"
    ctx.fillText(
      "Upper row: pcb_via. Lower row: pcb_trace.route via.",
      20,
      y + 48,
    )
    ctx.font = "12px ViaSnapshot"
    for (const [i, tenting] of flags.entries()) {
      ctx.fillText(
        `tented_on_top: ${tenting.tented_on_top}`,
        i * 250 + 15,
        y + 70,
      )
      ctx.fillText(
        `tented_on_bottom: ${tenting.tented_on_bottom}`,
        i * 250 + 15,
        y + 92,
      )
    }
  }
  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
  )
}, 30_000)
