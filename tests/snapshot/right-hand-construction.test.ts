import { expect, test } from "bun:test"
import { maths, measurements, transforms } from "@jscad/modeling"
import {
  handColors,
  handFingerSegments,
  makeRightHandModel,
  orientHandPoint,
  rightHandCases,
} from "../fixtures/right-hand-model"

test("native hand distal directions form a right-handed basis under every cyclic pose", () => {
  const { vec3 } = maths
  const expected = {
    x: { thumb: [1, 0, 0], index: [0, 1, 0], middle: [0, 0, 1] },
    y: { thumb: [0, 1, 0], index: [0, 0, 1], middle: [1, 0, 0] },
    z: { thumb: [0, 0, 1], index: [1, 0, 0], middle: [0, 1, 0] },
  } satisfies Record<
    string,
    Record<keyof typeof handFingerSegments, [number, number, number]>
  >
  for (const { axis } of rightHandCases) {
    const native = makeRightHandModel(axis)
    const direction = (finger: keyof typeof handFingerSegments) => {
      const { start, end } = handFingerSegments[finger]
      return vec3.normalize(
        vec3.create(),
        vec3.subtract(
          vec3.create(),
          orientHandPoint(end, axis),
          orientHandPoint(start, axis),
        ),
      )
    }
    const thumb = direction("thumb")
    const index = direction("index")
    const middle = direction("middle")
    const rotationAxis = { x: 0, y: 1, z: 2 }[axis]
    const thumbGeometry = native.geometries.find(
      (entry) => entry.color === handColors.thumb,
    )!.geom
    // Construction only: rotating the native model around its thumb axis
    // keeps the thumb centerline in place, for either sign of quarter-turn.
    for (const endpoint of Object.values(handFingerSegments.thumb)) {
      const point = orientHandPoint(endpoint, axis)
      for (let coordinate = 0; coordinate < 3; coordinate++) {
        if (coordinate !== rotationAxis) expect(point[coordinate]).toBe(0)
      }
    }
    for (const angle of [-Math.PI / 2, Math.PI / 2]) {
      const rotation: [number, number, number] = [0, 0, 0]
      rotation[rotationAxis] = angle
      const [min, max] = measurements.measureBoundingBox(
        transforms.rotate(rotation, thumbGeometry),
      )
      for (let coordinate = 0; coordinate < 3; coordinate++) {
        if (coordinate !== rotationAxis) {
          expect((min[coordinate]! + max[coordinate]!) / 2).toBeCloseTo(0, 8)
        }
      }
    }
    for (const finger of ["thumb", "index", "middle"] as const) {
      expect(direction(finger)).toEqual(expected[axis][finger])
      const { start, end } = handFingerSegments[finger]
      const distal = native.geometries.find(
        (entry) => entry.color === handColors[finger],
      )!
      const [min, max] = measurements.measureBoundingBox(distal.geom)
      const center = vec3.scale(
        vec3.create(),
        vec3.add(vec3.create(), min, max),
        0.5,
      )
      const midpoint = orientHandPoint(
        vec3.scale(vec3.create(), vec3.add(vec3.create(), start, end), 0.5),
        axis,
      )
      for (let coordinate = 0; coordinate < 3; coordinate++) {
        expect(center[coordinate]!).toBeCloseTo(midpoint[coordinate]!, 8)
      }
      const spans = vec3.subtract(vec3.create(), max, min)
      const longAxis = direction(finger).indexOf(1)
      for (let coordinate = 0; coordinate < 3; coordinate++) {
        if (coordinate !== longAxis) {
          expect(spans[longAxis]!).toBeGreaterThan(spans[coordinate]!)
        }
      }
      // Each distal segment extends away from the datum along its long axis.
      // Thus its exported long-axis midpoint sign identifies finger direction.
      expect(vec3.dot(center, direction(finger))).toBeGreaterThan(0)
    }
    expect(vec3.cross(vec3.create(), index, middle)).toEqual(thumb)
    expect(vec3.dot(index, middle)).toBe(0)
    expect(vec3.dot(thumb, index)).toBe(0)
    expect(vec3.dot(thumb, middle)).toBe(0)
    const x = orientHandPoint([1, 0, 0], axis)
    const y = orientHandPoint([0, 1, 0], axis)
    const z = orientHandPoint([0, 0, 1], axis)
    expect(vec3.dot(vec3.cross(vec3.create(), x, y), z)).toBe(1)
  }
})
