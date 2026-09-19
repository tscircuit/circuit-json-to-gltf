import { expect, test } from "bun:test"
import { maths, measurements, transforms } from "@jscad/modeling"
import { measureGripRotation } from "../fixtures/grip-measurement"
import {
  gripArrowPath,
  gripFingerPaths,
  handColors,
  handMarkerCenter,
  handPalm,
  handThumbSegment,
  makeRightHandModel,
  orientHandPoint,
  rightHandCases,
} from "../fixtures/right-hand-model"

test("native grip has a palm, perpendicular wrist, and two right-angle finger bends", () => {
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
    const palm = native.geometries.find(
      (entry) => entry.color === handColors.palm,
    )!.geom
    const wrist = native.geometries.find(
      (entry) => entry.color === handColors.wrist,
    )!.geom
    const [palmMin, palmMax] = measurements.measureBoundingBox(palm)
    const [wristMin, wristMax] = measurements.measureBoundingBox(wrist)
    const wristSize = vec3.subtract(vec3.create(), wristMax, wristMin)
    const wristAxisIndex = wristSize.indexOf(Math.max(...wristSize))
    expect(wristAxisIndex).not.toBe(axisIndex)
    const [thumbMin, thumbMax] = measurements.measureBoundingBox(thumb)
    const thumbPosition =
      (thumbMin[wristAxisIndex]! + thumbMax[wristAxisIndex]!) / 2
    expect(thumbPosition - palmMin[wristAxisIndex]!).toBeLessThan(
      palmMax[wristAxisIndex]! - thumbPosition,
    )
    const palmNormalIndex = orientHandPoint([0, 1, 0], axis).indexOf(1)
    // The first skin-colored piece is the thumb's angled connector.
    const elbow = native.geometries.find(
      (entry) => entry.color === handColors.skin,
    )!.geom
    const [elbowMin, elbowMax] = measurements.measureBoundingBox(elbow)
    const elbowCenter = vec3.scale(
      vec3.create(),
      vec3.add(vec3.create(), elbowMin, elbowMax),
      0.5,
    )
    const expectedElbow = orientHandPoint([-0.5, 0, 1.5], axis)
    for (let i = 0; i < 3; i++) {
      expect(elbowCenter[i]!).toBeCloseTo(expectedElbow[i]!, 8)
    }
    for (const [min, max] of [
      [thumbMin, thumbMax],
      [elbowMin, elbowMax],
    ]) {
      expect((min![palmNormalIndex]! + max![palmNormalIndex]!) / 2).toBeCloseTo(
        (palmMin[palmNormalIndex]! + palmMax[palmNormalIndex]!) / 2,
        8,
      )
    }
    expect((wristMin[axisIndex]! + wristMax[axisIndex]!) / 2).toBeCloseTo(
      (palmMin[axisIndex]! + palmMax[axisIndex]!) / 2,
      8,
    )
    expect(wristSize[axisIndex]!).toBeLessThan(
      palmMax[axisIndex]! - palmMin[axisIndex]!,
    )
    for (let i = 0; i < 3; i++) {
      expect(wristMax[i]!).toBeGreaterThan(palmMin[i]!)
      expect(wristMin[i]!).toBeLessThan(palmMax[i]!)
    }
    for (const { points } of gripFingerPaths) {
      expect(points).toHaveLength(4)
      const root = orientHandPoint(points[0]!, axis)
      for (let i = 0; i < 3; i++) {
        expect(root[i]!).toBeGreaterThan(palmMin[i]!)
        expect(root[i]!).toBeLessThan(palmMax[i]!)
      }
      const segments = points
        .slice(1)
        .map((end, i) =>
          orientHandPoint(vec3.subtract(vec3.create(), end, points[i]!), axis),
        )
      for (const segment of segments) {
        expect(vec3.length(segment)).toBeLessThan(handPalm.size[0])
      }
      for (let i = 1; i < segments.length; i++) {
        expect(
          measureGripRotation(
            axis,
            point(segments[i - 1]!),
            point(segments[i]!),
          ),
        ).toBeCloseTo(90, 8)
      }
    }
    for (const endpoint of Object.values(handThumbSegment)) {
      const position = orientHandPoint(endpoint, axis)
      expect(position[axisIndex]!).toBeGreaterThan(0)
      for (let i = 0; i < 3; i++) {
        if (i !== axisIndex) expect(position[i]).toBe(0)
      }
    }
    let totalCurl = 0
    for (let i = 1; i < gripArrowPath.length; i++) {
      const angle = measureGripRotation(
        axis,
        point(orientHandPoint(gripArrowPath[i - 1]!, axis)),
        point(orientHandPoint(gripArrowPath[i]!, axis)),
      )
      expect(angle).toBeGreaterThan(0)
      totalCurl += angle
    }
    expect(totalCurl).toBeCloseTo(180, 8)
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
