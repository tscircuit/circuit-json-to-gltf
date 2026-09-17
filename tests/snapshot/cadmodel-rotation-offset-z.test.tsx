import { expect, test } from "bun:test"
import { renderCadmodelRotationOffset } from "../fixtures/cadmodel-rotation-offset"
import {
  KEYED_CAD_MODEL_ORIGIN,
  KEYED_CAD_MODEL_URL,
} from "../fixtures/keyed-cad-model"

test("TSX cadmodel +Z offset exports the correct right-hand turn", async () => {
  const result = await renderCadmodelRotationOffset("z", (degrees) => (
    <cadmodel
      modelUrl={KEYED_CAD_MODEL_URL}
      modelOriginPosition={KEYED_CAD_MODEL_ORIGIN}
      zOffsetFromSurface={6}
      rotationOffset={{ x: 0, y: 0, z: degrees }}
    />
  ))
  expect(result.rotated.cad.rotation).toEqual({ x: 0, y: 0, z: 90 })
  expect(result.initial.pcb.rotation).toBe(0)
  expect(result.rotated.pcb.rotation).toBe(0)
  expect(result.measuredDegrees).toBeCloseTo(90, 5)
  expect(result.rotated.marker.x).toBeCloseTo(-1, 5)
  expect(result.rotated.marker.y).toBeCloseTo(1.5, 5)
  expect(result.rotated.marker.z).toBeCloseTo(2, 5)
  await expect(result.png).toMatchPngSnapshot(
    import.meta.path,
    "cadmodel-rotation-offset-z",
  )
}, 30_000)
