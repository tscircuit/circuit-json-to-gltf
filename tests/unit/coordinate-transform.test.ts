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

  // X is preserved here; GLTFBuilder.convertMeshToGLTFOrientation applies the
  // single canonical X-mirror to every mesh at export time.
  expect([mappedX.x, mappedX.y, mappedX.z]).toEqual([1, 0, 0])
  // Circuit +Y is forward, scene +Z. The rotateX(-PI/2) this replaces sent it
  // to -Z, flipping JSCAD geometry relative to every other loader.
  expect(mappedY.x).toBeCloseTo(0)
  expect(mappedY.y).toBeCloseTo(0)
  expect(mappedY.z).toBeCloseTo(1)
  expect(mappedZ.x).toBeCloseTo(0)
  expect(mappedZ.y).toBeCloseTo(1)
  expect(mappedZ.z).toBeCloseTo(0)

  // Identical to the OBJ loader's Z-up -> Y-up basis, so JSCAD geometry and OBJ
  // component models share one frame before the builder's X-mirror.
  const obj = COORDINATE_TRANSFORMS.OBJ_Z_UP_TO_Y_UP
  expect(applyCoordinateTransform({ x: 1, y: 2, z: 3 }, transform)).toEqual(
    applyCoordinateTransform({ x: 1, y: 2, z: 3 }, obj),
  )
})
