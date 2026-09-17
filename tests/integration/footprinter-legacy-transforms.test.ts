import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import type { CoordinateTransformConfig } from "../../lib/types"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { footprinterCircuit } from "../fixtures/footprinter-xyz"

const cases: {
  name: string
  transform?: CoordinateTransformConfig
  normal?: CadComponent["model_board_normal_direction"]
}[] = [
  { name: "explicit-identity", transform: {} },
  {
    name: "explicit-custom",
    transform: {
      axisMapping: { x: "-y", y: "z", z: "x" },
      rotation: { z: 17 },
    },
  },
  {
    name: "explicit-default-copy",
    transform: {
      ...COORDINATE_TRANSFORMS.FOOTPRINTER_MODEL_TRANSFORM,
    },
  },
  { name: "normal-x-negative", normal: "x-" },
  { name: "normal-y-positive", normal: "y+" },
  { name: "normal-y-negative", normal: "y-" },
]

test.each(cases)(
  "nondefault footprinter mapping defers CAD rotation to the scene: $name",
  async ({ transform, normal }) => {
    const overrides: Partial<CadComponent> = {
      model_board_normal_direction: normal,
      model_origin_position: { x: 0.3, y: -0.7, z: 0.2 },
      size: { x: 9, y: 8, z: 4 },
      model_object_fit: "fill_bounds",
    }
    const options = {
      coordinateTransform: transform,
      renderBoardTextures: false,
    }
    const unrotated = await convertCircuitJsonTo3D(
      footprinterCircuit({ x: 0, y: 0, z: 0 }, overrides),
      options,
    )
    const rotated = await convertCircuitJsonTo3D(
      footprinterCircuit({ x: 23, y: 31, z: 47 }, overrides),
      options,
    )
    expect(unrotated.boxes).toHaveLength(1)
    expect(rotated.boxes).toHaveLength(1)
    const reference = unrotated.boxes[0]!
    const box = rotated.boxes[0]!

    // Only the default loader frame opts into baked XYZ placement. These
    // compatibility paths keep the legacy scene Euler fields, in radians.
    expect(box.rotation).toEqual({
      x: (23 * Math.PI) / 180,
      y: (47 * Math.PI) / 180,
      z: (31 * Math.PI) / 180,
    })
    expect(box.center).toEqual({ x: 7, y: 3, z: -4 })
    expect(box.mesh).toBeDefined()
    expect(box.mesh).toEqual(reference.mesh)
    expect(box.size.x).toBeCloseTo(9, 5)
    expect(box.size.y).toBeCloseTo(4, 5)
    expect(box.size.z).toBeCloseTo(8, 5)
  },
)
