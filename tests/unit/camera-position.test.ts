import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import {
  CAMERA_PRESET_DIRECTIONS,
  getBestCameraPosition,
} from "../../lib/utils/camera-position"

const circuitJson: CircuitJson = [
  {
    type: "pcb_board",
    pcb_board_id: "board1",
    center: { x: 10, y: 5 },
    width: 20,
    height: 10,
    thickness: 1.6,
  },
]

test("camera presets expose the expected standard view directions", () => {
  expect(CAMERA_PRESET_DIRECTIONS.isometric).toEqual([-0.7, 1.2, -0.8])
  expect(CAMERA_PRESET_DIRECTIONS.top_down[1]).toBeGreaterThan(0)
  expect(CAMERA_PRESET_DIRECTIONS.bottom_up[1]).toBeLessThan(0)
  expect(CAMERA_PRESET_DIRECTIONS.left_side).toEqual([-1, 0, 0])
  expect(CAMERA_PRESET_DIRECTIONS.right_side).toEqual([1, 0, 0])
  expect(CAMERA_PRESET_DIRECTIONS.front).toEqual([0, 0, 1])
  expect(CAMERA_PRESET_DIRECTIONS.back).toEqual([0, 0, -1])
})

test("getBestCameraPosition supports top and bottom presets", () => {
  const topDown = getBestCameraPosition(circuitJson, {
    preset: "top_down",
    aspectRatio: 1,
  })
  const bottomUp = getBestCameraPosition(circuitJson, {
    preset: "bottom_up",
    aspectRatio: 1,
  })

  expect(topDown.lookAt).toEqual([-10, 0, 5])
  expect(topDown.camPos[1]).toBeGreaterThan(0)
  expect(Number.isFinite(topDown.camPos[0])).toBe(true)
  expect(Number.isFinite(topDown.camPos[2])).toBe(true)
  expect(Math.abs(topDown.camPos[0] - topDown.lookAt[0])).toBeLessThan(0.1)
  expect(Math.abs(topDown.camPos[2] - topDown.lookAt[2])).toBeLessThan(0.1)

  expect(bottomUp.lookAt).toEqual(topDown.lookAt)
  expect(bottomUp.camPos[1]).toBeLessThan(0)
  expect(Math.abs(bottomUp.camPos[0] - bottomUp.lookAt[0])).toBeLessThan(0.1)
  expect(Math.abs(bottomUp.camPos[2] - bottomUp.lookAt[2])).toBeLessThan(0.1)
})

test("getBestCameraPosition supports side and front/back presets", () => {
  const leftSide = getBestCameraPosition(circuitJson, { preset: "left_side" })
  const rightSide = getBestCameraPosition(circuitJson, { preset: "right_side" })
  const front = getBestCameraPosition(circuitJson, { preset: "front" })
  const back = getBestCameraPosition(circuitJson, { preset: "back" })

  expect(leftSide.lookAt).toEqual([-10, 0, 5])
  expect(rightSide.lookAt).toEqual(leftSide.lookAt)
  expect(front.lookAt).toEqual(leftSide.lookAt)
  expect(back.lookAt).toEqual(leftSide.lookAt)

  expect(leftSide.camPos[0]).toBeGreaterThan(leftSide.lookAt[0])
  expect(rightSide.camPos[0]).toBeLessThan(rightSide.lookAt[0])
  expect(front.camPos[2]).toBeGreaterThan(front.lookAt[2])
  expect(back.camPos[2]).toBeLessThan(back.lookAt[2])
})

test("explicit direction still overrides the preset", () => {
  const overridden = getBestCameraPosition(circuitJson, {
    preset: "top_down",
    direction: [0, 1, 1],
  })

  expect(overridden.camPos[2]).toBeGreaterThan(overridden.lookAt[2] + 1)
})

test("ortho mode uses a narrow perspective fit by default", () => {
  const perspective = getBestCameraPosition(circuitJson, {
    preset: "top_down",
    aspectRatio: 1,
  })
  const pseudoOrtho = getBestCameraPosition(circuitJson, {
    preset: "top_down",
    aspectRatio: 1,
    ortho: true,
  })

  expect(pseudoOrtho.fov).toBe(4)
  expect(pseudoOrtho.camPos[1]).toBeGreaterThan(perspective.camPos[1])
  expect(Math.abs(pseudoOrtho.camPos[0] - pseudoOrtho.lookAt[0])).toBeLessThan(
    0.5,
  )
  expect(Math.abs(pseudoOrtho.camPos[2] - pseudoOrtho.lookAt[2])).toBeLessThan(
    0.5,
  )
})

test("explicit fov still overrides ortho mode", () => {
  const overridden = getBestCameraPosition(circuitJson, {
    preset: "top_down",
    ortho: true,
    fov: 7,
  })

  expect(overridden.fov).toBe(7)
})
