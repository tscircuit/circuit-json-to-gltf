import { expect, test } from "bun:test"
import {
  COORDINATE_TRANSFORMS,
  applyCoordinateTransform,
} from "../../lib/utils/coordinate-transform"

test("STEP transform preserves board direction while remapping STEP axes", () => {
  expect(
    applyCoordinateTransform(
      { x: 1, y: 2, z: 3 },
      COORDINATE_TRANSFORMS.STEP_INVERTED,
    ),
  ).toEqual({ x: 1, y: 3, z: 2 })
})
