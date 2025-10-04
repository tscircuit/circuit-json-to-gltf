import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib"
import type { CircuitJson } from "circuit-json"
import * as fs from "node:fs"
import * as path from "node:path"

const fixturePath = path.join(
  __dirname,
  "../fixtures/bottom-layer-circuit.json",
)

function loadFixture(): CircuitJson {
  const data = fs.readFileSync(fixturePath, "utf-8")
  return JSON.parse(data)
}

test("bottom layer components are placed beneath the board", async () => {
  const circuitJson = loadFixture()

  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
  })

  expect(scene.boxes.length).toBeGreaterThanOrEqual(3)

  const topBox = scene.boxes.find((box) => box.label === "TOP1")
  const bottomBox = scene.boxes.find((box) => box.label === "BOT1")

  expect(topBox).toBeDefined()
  expect(bottomBox).toBeDefined()

  expect(topBox!.center.y).toBeGreaterThan(0)
  expect(bottomBox!.center.y).toBeLessThan(0)
  expect(topBox!.center.y).toBeCloseTo(1.8, 5)
  expect(bottomBox!.center.y).toBeCloseTo(-1.8, 5)
})
