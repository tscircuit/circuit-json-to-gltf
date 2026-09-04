import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import flashlight from "../assets/usb-c-flashlight.json"
import { renderGlbToPng } from "../renderGlbToPng"

// seveibar/usb-c-flashlight v1.0.0, registry release
// 35fa29c2-6067-4d62-9c97-4b418fb4870f, dist/index/circuit.json.
// The current export shifts the USB connector away from its solder pad row.
test("reproduces the USB-C flashlight connector offset in 3D exports", async () => {
  const circuitJson = flashlight as CircuitJson
  const glb = await convertCircuitJsonToGltf(circuitJson, { format: "glb" })
  await expect(
    renderGlbToPng(glb as ArrayBuffer, circuitJson),
  ).toMatchPngSnapshot(import.meta.path)
})
