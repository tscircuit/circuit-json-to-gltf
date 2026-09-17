import { expect, test } from "bun:test"
import { maths, measurements, transforms } from "@jscad/modeling"
import { measureGripRotation } from "../fixtures/grip-measurement"
import {
  gripArrowPath,
  gripFingerPaths,
  handColors,
  handMarkerCenter,
  handThumbSegment,
  makeRightHandModel,
  orientHandPoint,
  rightHandCases,
} from "../fixtures/right-hand-model"

test("native grip has positive finger curl and a stationary axial thumb", () => {
  const { vec3 } = maths
  const point = ([x, y, z]: [number, number, number]) => ({ x, y, z })
  expect(gripFingerPaths.map(({ name }) => name)).toEqual([
    "index",
    "middle",
    "ring",
    "pinky",
  ])
  for (const { axis } of rightHandCases) {
    const native = makeRightHandModel(axis)
    const axisIndex = { x: 0, y: 1, z: 2 }[axis]
    const thumb = native.geometries.find(
      (entry) => entry.color === handColors.thumb,
    )!.geom
    const marker = native.geometries.find(
      (entry) => entry.color === handColors.marker,
    )!.geom
    for (const endpoint of Object.values(handThumbSegment)) {
      const position = orientHandPoint(endpoint, axis)
      expect(position[axisIndex]!).toBeGreaterThan(0)
      for (let i = 0; i < 3; i++) {
        if (i !== axisIndex) expect(position[i]).toBe(0)
      }
    }
    for (const { points, expectedCurl } of [
      ...gripFingerPaths.map(({ points }) => ({ points, expectedCurl: 230 })),
      { points: gripArrowPath, expectedCurl: 180 },
    ]) {
      let totalCurl = 0
      for (let i = 1; i < points.length; i++) {
        const angle = measureGripRotation(
          axis,
          point(orientHandPoint(points[i - 1]!, axis)),
          point(orientHandPoint(points[i]!, axis)),
        )
        expect(angle).toBeGreaterThan(0)
        totalCurl += angle
      }
      expect(totalCurl).toBeCloseTo(expectedCurl, 8)
    }
    const [markerMin, markerMax] = measurements.measureBoundingBox(marker)
    const markerCenter = vec3.scale(
      vec3.create(),
      vec3.add(vec3.create(), markerMin, markerMax),
      0.5,
    )
    const expectedMarker = orientHandPoint(handMarkerCenter, axis)
    for (let i = 0; i < 3; i++) {
      expect(markerCenter[i]!).toBeCloseTo(expectedMarker[i]!, 8)
    }
    // These are construction/measurement checks, not exporter assertions.
    for (const angle of [-90, -30, 0, 30, 90]) {
      const rotation: [number, number, number] = [0, 0, 0]
      rotation[axisIndex] = (angle * Math.PI) / 180
      const [min, max] = measurements.measureBoundingBox(
        transforms.rotate(rotation, marker),
      )
      const rotatedCenter = vec3.scale(
        vec3.create(),
        vec3.add(vec3.create(), min, max),
        0.5,
      )
      expect(
        measureGripRotation(axis, point(markerCenter), point(rotatedCenter)),
      ).toBeCloseTo(angle, 8)
      const [thumbMin, thumbMax] = measurements.measureBoundingBox(
        transforms.rotate(rotation, thumb),
      )
      for (let i = 0; i < 3; i++) {
        if (i !== axisIndex) {
          expect((thumbMin[i]! + thumbMax[i]!) / 2).toBeCloseTo(0, 8)
        }
      }
    }
    const x = orientHandPoint([1, 0, 0], axis)
    const y = orientHandPoint([0, 1, 0], axis)
    const z = orientHandPoint([0, 0, 1], axis)
    expect(vec3.dot(vec3.cross(vec3.create(), x, y), z)).toBe(1)
    expect(() =>
      measureGripRotation(axis, { x: 0, y: 0, z: 0 }, point(markerCenter)),
    ).toThrow("off the rotation axis")
  }
})
