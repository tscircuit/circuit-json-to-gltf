import { expect, test } from "bun:test"
import type { PcbPlatedHole } from "circuit-json"
import { createHoleLoops } from "../lib/utils/pcb-hole-loops"

const boardCenter = { x: 0, y: 0 }

const bounds = (loop: { x: number; y: number }[]) => ({
  minX: Math.min(...loop.map((point) => point.x)),
  maxX: Math.max(...loop.map((point) => point.x)),
  minY: Math.min(...loop.map((point) => point.y)),
  maxY: Math.max(...loop.map((point) => point.y)),
})

const rotatedPillHole = (rotation: number): PcbPlatedHole =>
  ({
    type: "pcb_plated_hole",
    pcb_plated_hole_id: "pcb_plated_hole_0",
    pcb_component_id: "pcb_component_0",
    shape: "rotated_pill_hole_with_rect_pad",
    hole_width: 1,
    hole_height: 3,
    hole_diameter: 1,
    rect_pad_width: 2,
    rect_pad_height: 4,
    rect_ccw_rotation: rotation,
    x: 0,
    y: 0,
    layers: ["top", "bottom"],
  }) as PcbPlatedHole

test("rotated_pill_hole_with_rect_pad drills a pill, not a circle from hole_diameter", () => {
  const loops = createHoleLoops({
    boardCenter,
    holes: [],
    platedHoles: [rotatedPillHole(0)],
    segments: 24,
  })

  expect(loops).toHaveLength(1)
  const box = bounds(loops[0]!)
  expect(box.maxX - box.minX).toBeCloseTo(1, 5)
  expect(box.maxY - box.minY).toBeCloseTo(3, 5)
})

test("rotated_pill_hole_with_rect_pad honors rect_ccw_rotation", () => {
  const loops = createHoleLoops({
    boardCenter,
    holes: [],
    platedHoles: [rotatedPillHole(90)],
    segments: 24,
  })

  expect(loops).toHaveLength(1)
  const box = bounds(loops[0]!)
  expect(box.maxX - box.minX).toBeCloseTo(3, 5)
  expect(box.maxY - box.minY).toBeCloseTo(1, 5)
})
