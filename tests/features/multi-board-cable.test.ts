import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { convertCircuitJsonTo3D as convertBrowserScene } from "../../lib/browser"
import circuitJson from "../fixtures/usb-c-multi-board.json"

const json = circuitJson as CircuitJson

test("both USB-C boards retain their geometry and individual PCB textures", async () => {
  const scene = await convertCircuitJsonTo3D(json)
  const boards = scene.boxes.filter(
    (box) => box.size.x === 32 && box.size.z === 28,
  )
  expect(boards).toHaveLength(2)
  expect(boards.map((box) => box.center.x).sort((a, b) => a - b)).toEqual([
    -60, 60,
  ])
  for (const board of boards) {
    expect(board.size.y).toBe(1.4)
    expect(board.texture?.top).toStartWith("data:image/png;base64,")
    expect(board.texture?.bottom).toStartWith("data:image/png;base64,")
  }
  expect(scene.boxes.some((box) => box.label?.endsWith(" / jacket"))).toBe(true)
  const glb = await convertCircuitJsonToGltf(json, { format: "glb" })
  expect(
    new TextDecoder().decode(new Uint8Array(glb as ArrayBuffer).slice(0, 4)),
  ).toBe("glTF")
})

test("browser export retains multiple boards without a cable", async () => {
  const boards = json.filter((element) => element.type === "pcb_board")
  const scene = await convertBrowserScene(boards)
  expect(scene.boxes).toHaveLength(2)
  expect(scene.boxes.map((box) => box.center.x).sort((a, b) => a - b)).toEqual([
    -60, 60,
  ])
})
