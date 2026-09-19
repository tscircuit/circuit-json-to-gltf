import { expect, test } from "bun:test"
import {
  applyCoordinateTransform,
  COORDINATE_TRANSFORMS,
} from "../../lib/utils/coordinate-transform"

test("STEP transform preserves board direction while remapping STEP axes", () => {
  expect(
    applyCoordinateTransform(
      { x: 1, y: 2, z: 3 },
      COORDINATE_TRANSFORMS.STEP_INVERTED,
    ),
  ).toEqual({ x: 1, y: 3, z: 2 })
})

test("Circuit Z-up basis matches the OBJ loader's basis (Circuit +Y -> scene +Z)", () => {
  const transform = COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP
  const mappedX = applyCoordinateTransform({ x: 1, y: 0, z: 0 }, transform)
  const mappedY = applyCoordinateTransform({ x: 0, y: 1, z: 0 }, transform)
  const mappedZ = applyCoordinateTransform({ x: 0, y: 0, z: 1 }, transform)

  // These explicit legacy transforms are no longer the loader defaults.
  expect([mappedX.x, mappedX.y, mappedX.z]).toEqual([1, 0, 0])
  // The opt-in swap preserves its historical +Y -> +Z mapping.
  expect(mappedY.x).toBeCloseTo(0)
  expect(mappedY.y).toBeCloseTo(0)
  expect(mappedY.z).toBeCloseTo(1)
  expect(mappedZ.x).toBeCloseTo(0)
  expect(mappedZ.y).toBeCloseTo(1)
  expect(mappedZ.z).toBeCloseTo(0)

  // The two exported legacy constants are aliases by value.
  const obj = COORDINATE_TRANSFORMS.OBJ_Z_UP_TO_Y_UP
  expect(applyCoordinateTransform({ x: 1, y: 2, z: 3 }, transform)).toEqual(
    applyCoordinateTransform({ x: 1, y: 2, z: 3 }, obj),
  )
})
