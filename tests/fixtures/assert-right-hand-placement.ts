import assert from "node:assert/strict"
import { renderHandPose } from "./render-right-hand"
import { rightHandCases } from "./right-hand-model"

const fixture = rightHandCases.find(({ axis }) => axis === process.argv[2])
if (!fixture) throw new Error("Expected right-hand axis x, y, or z")

const initial = await renderHandPose(fixture.axis, 0)
const rotated = await renderHandPose(fixture.axis, 90)
assert.equal(initial.thumb, `+${fixture.axis.toUpperCase()}`)
assert.equal(initial.index, fixture.index)
assert.equal(initial.middle, fixture.middle)
assert.equal(rotated.thumb, initial.thumb, "The thumb must stay on the axis")
assert.equal(
  rotated.index,
  initial.middle,
  "A positive right-hand quarter-turn sends the index toward the initial middle",
)
