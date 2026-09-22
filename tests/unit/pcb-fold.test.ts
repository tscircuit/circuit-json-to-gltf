import { expect, test } from "bun:test"
import { createPcbFold, type PcbBendRecord } from "../../lib/utils/pcb-fold"
import {
  createThreeDiscFlex,
  DISC_PITCH,
  STACK_HEIGHT,
} from "../../examples/three-disc-flex"

const bend: PcbBendRecord = {
  type: "pcb_bend",
  pcb_bend_id: "b1",
  pcb_board_id: "board",
  start: { x: 0, y: -10 },
  end: { x: 0, y: 10 },
  bend_angle: 90,
  bend_radius: 2,
  bend_side: "right",
}
const close = (
  p: { x: number; y: number; z: number },
  q: { x: number; y: number; z: number },
) => {
  expect(p.x).toBeCloseTo(q.x, 6)
  expect(p.y).toBeCloseTo(q.y, 6)
  expect(p.z).toBeCloseTo(q.z, 6)
}

test("quarter bend has correct fixed tangent, arc endpoint, height and orientation", () => {
  const fold = createPcbFold([bend], 0.15)
  // A quarter circle of radius 2 uses pi mm of neutral-surface length.
  close(fold.point({ x: -Math.PI / 2, y: 3, z: 0 }), {
    x: -Math.PI / 2,
    y: 3,
    z: 0,
  })
  close(fold.point({ x: Math.PI / 2, y: 3, z: 0 }), {
    x: 2 - Math.PI / 2,
    y: 3,
    z: 2,
  })
  close(fold.point({ x: Math.PI / 2 + 5, y: 3, z: 0.4 }), {
    x: 2 - Math.PI / 2 - 0.4,
    y: 3,
    z: 7,
  })
  close(fold.direction({ x: 0, y: 0, z: 1 }, { x: 10, y: 0, z: 0 }), {
    x: -1,
    y: 0,
    z: 0,
  })
  close(fold.point({ x: -4, y: 2, z: 0.4 }), { x: -4, y: 2, z: 0.4 })
})

test("four bends align all three discs, independent of input order", () => {
  const bends = createThreeDiscFlex().filter(
    (e): e is PcbBendRecord => e.type === "pcb_bend",
  )
  for (const records of [bends, [...bends].reverse()]) {
    const fold = createPcbFold(records, 0.15)
    for (let i = 0; i < 3; i++) {
      close(fold.point({ x: (i - 1) * DISC_PITCH, y: 0, z: 0 }), {
        x: -DISC_PITCH,
        y: 0,
        z: i * STACK_HEIGHT,
      })
      close(
        fold.direction(
          { x: 0, y: 0, z: 1 },
          { x: (i - 1) * DISC_PITCH, y: 0, z: 0 },
        ),
        { x: 0, y: 0, z: i === 1 ? -1 : 1 },
      )
    }
  }
})

test("negative, left-side, reversed endpoints, and oblique axes have consistent signs", () => {
  const negative = createPcbFold([{ ...bend, bend_angle: -90 }], 0.15)
  close(negative.point({ x: Math.PI / 2, y: 3, z: 0 }), {
    x: 2 - Math.PI / 2,
    y: 3,
    z: -2,
  })
  const reversed = createPcbFold(
    [{ ...bend, start: bend.end, end: bend.start, bend_side: "left" }],
    0.15,
  )
  close(reversed.point({ x: Math.PI / 2, y: 3, z: 0 }), {
    x: 2 - Math.PI / 2,
    y: 3,
    z: 2,
  })
  const left = createPcbFold([{ ...bend, bend_side: "left" }], 0.15)
  close(left.point({ x: -Math.PI / 2, y: 3, z: 0 }), {
    x: Math.PI / 2 - 2,
    y: 3,
    z: 2,
  })
  const oblique = createPcbFold(
    [{ ...bend, start: { x: 10, y: -10 }, end: { x: -10, y: 10 } }],
    0.15,
  )
  close(
    oblique.point({
      x: Math.PI / (2 * Math.sqrt(2)),
      y: Math.PI / (2 * Math.sqrt(2)),
      z: 0,
    }),
    {
      x: (2 - Math.PI / 2) / Math.sqrt(2),
      y: (2 - Math.PI / 2) / Math.sqrt(2),
      z: 2,
    },
  )
})

test("invalid or unsupported folds and rigid objects crossing zones fail explicitly", () => {
  expect(() => createPcbFold([{ ...bend, bend_radius: 0 }], 0.15)).toThrow()
  expect(() => createPcbFold([{ ...bend, bend_angle: NaN }], 0.15)).toThrow()
  expect(() => createPcbFold([{ ...bend, end: bend.start }], 0.15)).toThrow()
  expect(() =>
    createPcbFold([bend, { ...bend, pcb_bend_id: "b2" }], 0.15),
  ).toThrow("Overlapping")
  expect(() =>
    createPcbFold(
      [bend, { ...bend, start: { x: -10, y: 0 }, end: { x: 10, y: 0 } }],
      0.15,
    ),
  ).toThrow("parallel")
  expect(() =>
    createPcbFold([bend], 0.15).assertRigid(
      [
        { x: -2, y: 0, z: 0 },
        { x: 2, y: 0, z: 0 },
      ],
      "U1",
    ),
  ).toThrow("U1 intersects")
  close(
    createPcbFold([{ ...bend, bend_angle: 0 }], 0.15).point({
      x: 4,
      y: 2,
      z: 1,
    }),
    { x: 4, y: 2, z: 1 },
  )
})
