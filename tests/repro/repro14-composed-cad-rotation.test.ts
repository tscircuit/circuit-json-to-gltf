import { expect, test } from "bun:test"
import { createCanvas, GlobalFonts, loadImage } from "@napi-rs/canvas"
import tscircuitFont from "@tscircuit/alphabet/base64font"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import {
  createNema17ControllerRotationRepro,
  motorControllerCamera,
} from "../fixtures/nema17-controller-rotation"

test("repro14: NEMA17 points away from its rear-mounted RP2040 controller", async () => {
  const glb = await convertCircuitJsonToGltf(
    await createNema17ControllerRotationRepro(),
    { format: "glb" },
  )
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary glTF")
  const afterPng = await renderGLTFToPNGFromGLB(glb, motorControllerCamera)
  const beforePng = await Bun.file(
    new URL("../assets/nema17-controller-before.png", import.meta.url),
  ).bytes()

  GlobalFonts.register(
    Buffer.from(tscircuitFont, "base64"),
    "MotorReproSnapshot",
  )
  const width = motorControllerCamera.width
  const canvas = createCanvas(width * 2, 650)
  const context = canvas.getContext("2d")
  context.fillStyle = "#f2f3f5"
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.fillStyle = "#162a43"
  context.font = "25px MotorReproSnapshot"
  context.fillText("NEMA17 + RP2040: the motor turns the wrong way", 20, 34)
  context.font = "17px MotorReproSnapshot"
  context.fillText(
    "Same PCB placement, motor rotation and camera in both views.",
    20,
    66,
  )

  for (const [panel, png] of [beforePng, afterPng].entries()) {
    const x = panel * width
    const color = panel === 0 ? "#bb331c" : "#067647"
    context.drawImage(await loadImage(png), x, 125)
    context.fillStyle = color
    context.font = "21px MotorReproSnapshot"
    context.fillText(
      panel === 0 ? "Before: PCB beside motor" : "After: PCB behind rear face",
      x + 20,
      108,
    )
    context.font = "16px MotorReproSnapshot"
    context.fillText(
      panel === 0 ? "Shaft points toward us" : "Shaft points away from PCB",
      x + 265,
      568,
    )
    context.strokeStyle = color
    context.lineWidth = 2
    const shaftTip = panel === 0 ? [400, 420] : [455, 349]
    context.beginPath()
    context.moveTo(x + 405, 548)
    context.lineTo(x + shaftTip[0]!, shaftTip[1]!)
    context.stroke()
    context.beginPath()
    context.arc(x + shaftTip[0]!, shaftTip[1]!, 8, 0, Math.PI * 2)
    context.stroke()
    context.fillStyle = "#162a43"
    context.fillText("RP2040 PCB", x + 20, 610)
    context.font = "14px MotorReproSnapshot"
    context.fillText(
      panel === 0
        ? "Rear face no longer lines up with PCB"
        : "6 mm gap to rear face; JST faces us",
      x + 20,
      634,
    )
  }

  await expect(canvas.toBuffer("image/png")).toMatchPngSnapshot(
    import.meta.path,
  )

  // Actual exported GLB: Y-up, mm. Circuit +X (shaft) is scene -X.
  const triangles = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY).triangles
  const shaftTip = triangles
    .flatMap((triangle) => triangle.vertices)
    .filter((vertex) => Math.abs(vertex.x + 24) < 1e-5)
  expect(shaftTip.length).toBeGreaterThan(0)
  expect(
    Math.max(...shaftTip.map((vertex) => Math.abs(vertex.y))),
  ).toBeLessThanOrEqual(2.5)
  expect(
    Math.max(...shaftTip.map((vertex) => Math.abs(vertex.z))),
  ).toBeLessThanOrEqual(2.5)

  const pcbTriangles = triangles.filter(
    ({ color }) =>
      Array.isArray(color) &&
      color[1] > color[0] * 3 &&
      color[1] > color[2] * 1.5,
  )
  expect(pcbTriangles.length).toBeGreaterThan(0)
  expect(boundsOfTriangles(pcbTriangles).min.x).toBeCloseTo(38 + 6, 5)
}, 60_000)
