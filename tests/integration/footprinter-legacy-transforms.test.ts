import { expect, test } from "bun:test"
import { createHash } from "node:crypto"
import type { CadComponent } from "circuit-json"
import type { CoordinateTransformConfig } from "../../lib/types"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import {
  exportFootprinter,
  footprinterCircuit,
} from "../fixtures/footprinter-xyz"

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
  "nondefault footprinter mapping stays unchanged: $name",
  async ({ transform, normal }) => {
    const { mesh } = await exportFootprinter(
      footprinterCircuit(
        { x: 23, y: 31, z: 47 },
        {
          model_board_normal_direction: normal,
          model_origin_position: { x: 0.3, y: -0.7, z: 0.2 },
          size: { x: 9, y: 8, z: 4 },
          model_object_fit: "fill_bounds",
        },
      ),
      { coordinateTransform: transform },
    )
    // Recorded from origin/main, including every exported vertex and normal.
    // These paths intentionally retain their legacy behavior, not XYZ semantics.
    const geometry = JSON.stringify(mesh.triangles, (_key, value) =>
      typeof value === "number" ? Math.round(value * 1e5) / 1e5 : value,
    )
    expect({
      bounds: mesh.boundingBox,
      geometrySha256: createHash("sha256").update(geometry).digest("hex"),
    }).toMatchSnapshot()
  },
)
