import { expect, test } from "bun:test"
import { renderCadmodelRotationOffset } from "../fixtures/cadmodel-rotation-offset"
import {
  KEYED_CAD_MODEL_ORIGIN,
  KEYED_CAD_MODEL_URL,
} from "../fixtures/keyed-cad-model"

test("TSX cadmodel +X offset currently exports the opposite right-hand turn", async () => {
  const result = await renderCadmodelRotationOffset("x", (degrees) => (
    <cadmodel
      modelUrl={KEYED_CAD_MODEL_URL}
      modelOriginPosition={KEYED_CAD_MODEL_ORIGIN}
      zOffsetFromSurface={6}
      rotationOffset={{ x: degrees, y: 0, z: 0 }}
    />
  ))
  expect(result.rotated.cad.rotation).toEqual({ x: 90, y: 0, z: 0 })
  expect(result.initial.pcb.rotation).toBe(0)
  expect(result.rotated.pcb.rotation).toBe(0)
  // Pin the existing bug; a positive turn would put the key at (1.5, -2, 1).
  expect(result.measuredDegrees).toBeCloseTo(-90, 5)
  expect(result.rotated.marker.x).toBeCloseTo(1.5, 5)
  expect(result.rotated.marker.y).toBeCloseTo(2, 5)
  expect(result.rotated.marker.z).toBeCloseTo(-1, 5)
  await expect(result.png).toMatchPngSnapshot(
    import.meta.path,
    "cadmodel-rotation-offset-x",
  )
}, 30_000)
