import { mock } from "bun:test"
import * as vanilla from "jscad-electronics/vanilla"
import { makeRightHandModel, rightHandCases } from "./right-hand-model"

// Only loaded in the spawned fixture process. Capture the real function BEFORE
// Bun replaces its live export; every non-fixture string still uses that function.
const realGenerator = vanilla.getJscadModelForFootprint
mock.module("jscad-electronics/vanilla", () => ({
  ...vanilla,
  getJscadModelForFootprint: (
    ...args: Parameters<typeof realGenerator>
  ): ReturnType<typeof realGenerator> => {
    const fixture = rightHandCases.find(
      ({ axis }) => args[0] === `test-only-right-hand-${axis}`,
    )
    return fixture
      ? makeRightHandModel(fixture.axis, args[1])
      : realGenerator(...args)
  },
}))
