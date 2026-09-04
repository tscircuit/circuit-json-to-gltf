import { expect, test } from "bun:test"
import type { CadComponent, CircuitJson, PcbSmtPad } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import flashlight from "../assets/usb-c-flashlight.json"
import { renderGlbToPng } from "../renderGlbToPng"

// seveibar/usb-c-flashlight v1.0.0, registry release
// 35fa29c2-6067-4d62-9c97-4b418fb4870f, dist/index/circuit.json.
const circuitJson = flashlight as CircuitJson

test("USB connector reaches its solder pads in the exported flashlight", async () => {
  const cad = circuitJson.find(
    (element): element is CadComponent =>
      element.type === "cad_component" && Boolean(element.model_obj_url),
  )!
  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
  })
  const connector = scene.boxes.find(
    (box) => box.mesh && box.center.z === cad.position.y,
  )!
  const pads = circuitJson.filter(
    (element): element is PcbSmtPad =>
      element.type === "pcb_smtpad" &&
      element.pcb_component_id === cad.pcb_component_id,
  )

  // This fixture rotates the connector 180 degrees. Its rear pin tips must
  // land within the solder pad row (Circuit JSON +Z up, scene +Y up, mm).
  const pinTipY = connector.center.z - connector.mesh!.boundingBox.min.z
  for (const pad of pads) {
    if (pad.shape !== "rect") throw new Error("Expected rectangular USB pads")
    expect(pinTipY).toBeGreaterThan(pad.y - pad.height / 2)
    expect(pinTipY).toBeLessThan(pad.y + pad.height / 2)
  }
  expect(pads.length).toBeGreaterThan(0)
})

test("renders the USB-C flashlight with the connector on its footprint", async () => {
  const glb = await convertCircuitJsonToGltf(circuitJson, { format: "glb" })
  await expect(
    renderGlbToPng(glb as ArrayBuffer, circuitJson),
  ).toMatchPngSnapshot(import.meta.path)
})
