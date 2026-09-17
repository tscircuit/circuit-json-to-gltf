import { expect, test } from "bun:test"
import { renderCadmodelRotationOffset } from "../fixtures/cadmodel-rotation-offset"
import {
  KEYED_CAD_MODEL_ORIGIN,
  KEYED_CAD_MODEL_URL,
} from "../fixtures/keyed-cad-model"

test("TSX cadmodel +Y offset currently exports the opposite right-hand turn", async () => {
  const result = await renderCadmodelRotationOffset("y", (degrees) => (
    <cadmodel
      modelUrl={KEYED_CAD_MODEL_URL}
      modelOriginPosition={KEYED_CAD_MODEL_ORIGIN}
      zOffsetFromSurface={6}
      rotationOffset={{ x: 0, y: degrees, z: 0 }}
    />
  ))
  expect(result.rotated.cad.rotation).toEqual({ x: 0, y: 90, z: 0 })
  expect(result.initial.pcb.rotation).toBe(0)
  expect(result.rotated.pcb.rotation).toBe(0)
  // Pin the existing bug; a positive turn would put the key at (2, 1, -1.5).
  expect(result.measuredDegrees).toBeCloseTo(-90, 5)
  expect(result.rotated.marker.x).toBeCloseTo(-2, 5)
  expect(result.rotated.marker.y).toBeCloseTo(1, 5)
  expect(result.rotated.marker.z).toBeCloseTo(1.5, 5)
  await expect(result.png).toMatchPngSnapshot(
    import.meta.path,
    "cadmodel-rotation-offset-y",
  )
}, 30_000)
