import { expect, test } from "bun:test"
import type { CadCable, CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { renderGLTFToPNGFromGLB } from "poppygl"
import "../fixtures/png-matcher"

const cables: CadCable[] = [
  "usb_c",
  "jst_sh_pins4",
  "jst_ph_pins6",
  "us_mains",
].map((cableprinter_string, i) => ({
  type: "cad_cable",
  cad_cable_id: `cad_cable_${i}`,
  name: cableprinter_string,
  from_source_component_id: `source_from_${i}`,
  to_source_component_id: `source_to_${i}`,
  cableprinter_string,
  path: Array.from({ length: 49 }, (_, j) => {
    const t = j / 48
    return {
      x: 25 + 90 * t,
      y: 30 + i * 60 + 25 * Math.sin(Math.PI * t),
      z: 10 + 8 * t,
    }
  }),
}))

test("resolved cable records export colored meshes at their world positions without a PCB", async () => {
  const scene = await convertCircuitJsonTo3D(cables as CircuitJson, {
    renderBoardTextures: false,
    drawFauxBoard: false,
  })
  expect(scene.boxes.filter((box) => box.label?.includes("wire-")).length).toBe(
    10,
  )
  expect(
    scene.boxes.find((box) => box.label === "usb_c / jacket")!.mesh!.boundingBox
      .min.x,
  ).toBeGreaterThan(20)
  expect(
    scene.boxes.find((box) => box.label === "usb_c / jacket")!.mesh!.boundingBox
      .min.y,
  ).toBeGreaterThan(7)
  const glb = await convertCircuitJsonToGltf(cables as CircuitJson, {
    format: "glb",
    drawFauxBoard: false,
  })
  const png = await renderGLTFToPNGFromGLB(Buffer.from(glb as ArrayBuffer), {
    width: 1100,
    height: 850,
    camPos: [-160, 250, 300],
    lookAt: [-65, 10, 110],
    grid: false,
    backgroundColor: [1, 1, 1],
  })
  await expect(png).toMatchPngSnapshot(import.meta.path)
})
