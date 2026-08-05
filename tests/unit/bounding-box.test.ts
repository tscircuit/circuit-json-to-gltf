import { expect, test } from "bun:test"
import type { Triangle } from "../../lib/types"
import {
  boundsOfPositions,
  boundsOfTriangles,
} from "../../lib/utils/bounding-box"

const triangleAt = (points: [number, number, number][]): Triangle =>
  ({
    vertices: points.map(([x, y, z]) => ({ x, y, z })),
    normal: { x: 0, y: 1, z: 0 },
  }) as Triangle

test("boundsOfTriangles spans every vertex of every triangle", () => {
  const bounds = boundsOfTriangles([
    triangleAt([
      [0, 0, 0],
      [2, 1, -1],
      [1, 5, 0],
    ]),
    triangleAt([
      [-3, 0, 4],
      [0, -2, 0],
      [1, 1, 1],
    ]),
  ])

  expect(bounds).toEqual({
    min: { x: -3, y: -2, z: -1 },
    max: { x: 2, y: 5, z: 4 },
  })
})

/**
 * The rule worth having in one place: an unguarded min/max scan leaves
 * Infinity/-Infinity here, which serializes to null and reads downstream as a
 * mesh of infinite size.
 */
test("boundsOfTriangles reports a zero box for no triangles", () => {
  expect(boundsOfTriangles([])).toEqual({
    min: { x: 0, y: 0, z: 0 },
    max: { x: 0, y: 0, z: 0 },
  })
})

test("boundsOfPositions reads a flat array as x/y/z triples", () => {
  // prettier-ignore
  const positions = [0, 0, 0, 2, 1, -1, -3, 5, 4]

  expect(boundsOfPositions(positions)).toEqual({
    min: { x: -3, y: 0, z: -1 },
    max: { x: 2, y: 5, z: 4 },
  })
})

test("boundsOfPositions reports a zero box for an empty array", () => {
  expect(boundsOfPositions([])).toEqual({
    min: { x: 0, y: 0, z: 0 },
    max: { x: 0, y: 0, z: 0 },
  })
})

/**
 * A trailing partial triple is malformed input; ignoring it keeps NaN out of
 * the box, where it would otherwise reach a glTF accessor's min/max.
 */
test("boundsOfPositions ignores a trailing partial triple", () => {
  expect(boundsOfPositions([1, 2, 3, 9, 9])).toEqual({
    min: { x: 1, y: 2, z: 3 },
    max: { x: 1, y: 2, z: 3 },
  })
})

/**
 * A non-finite vertex is skipped whole, not per axis: reporting the y/z of a
 * point whose x is NaN would mix a real extent with a fabricated one.
 */
test("bounds skip non-finite points rather than folding them in", () => {
  expect(boundsOfPositions([1, 2, 3, Number.NaN, 5, 6])).toEqual({
    min: { x: 1, y: 2, z: 3 },
    max: { x: 1, y: 2, z: 3 },
  })

  expect(
    boundsOfTriangles([
      triangleAt([
        [0, 0, 0],
        [2, 2, 2],
        [Number.POSITIVE_INFINITY, 9, 9],
      ]),
    ]),
  ).toEqual({
    min: { x: 0, y: 0, z: 0 },
    max: { x: 2, y: 2, z: 2 },
  })
})

test("bounds report a zero box when every point is non-finite", () => {
  expect(boundsOfPositions([Number.NaN, Number.NaN, Number.NaN])).toEqual({
    min: { x: 0, y: 0, z: 0 },
    max: { x: 0, y: 0, z: 0 },
  })
})
