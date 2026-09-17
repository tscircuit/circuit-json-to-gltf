import assert from "node:assert/strict"
import { measureGripRotation } from "./grip-measurement"
import { renderHandPose } from "./render-right-hand"
import {
  handMarkerCenter,
  orientHandPoint,
  rightHandCases,
} from "./right-hand-model"

const fixture = rightHandCases.find(({ axis }) => axis === process.argv[2])
if (!fixture) throw new Error("Expected right-hand axis x, y, or z")

const initial = await renderHandPose(fixture.axis, 0)
const rotated = await renderHandPose(fixture.axis, 90)
const initialMarker = orientHandPoint(handMarkerCenter, fixture.axis)
const initialThumb = orientHandPoint([0, 0, 3.45], fixture.axis)
for (const [index, axis] of (["x", "y", "z"] as const).entries()) {
  assert.ok(
    Math.abs(initial.markerCenter[axis] - initialMarker[index]!) < 0.00002,
    "The fiducial must start at its native position in Circuit JSON world coordinates",
  )
  assert.ok(
    Math.abs(initial.thumbCenter[axis] - initialThumb[index]!) < 0.00002,
    "The native thumb must lie on the positive rotation axis",
  )
  assert.ok(
    Math.abs(rotated.thumbCenter[axis] - initial.thumbCenter[axis]) < 0.00002,
    "The thumb center must remain stationary, not merely parallel to the axis",
  )
}
const measured = measureGripRotation(
  fixture.axis,
  initial.markerCenter,
  rotated.markerCenter,
)
assert.ok(
  Math.abs(measured - 90) < 0.0001,
  `Positive rotation must follow the curled right fingers: expected +90 deg, measured ${measured} deg`,
)
