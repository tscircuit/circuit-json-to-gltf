import { expect, test } from "bun:test"
import { loadJscadPlan } from "../../lib/loaders/jscad-plan"
import {
  fitMeshToCadBounds,
  getMeshOrigin,
} from "../../lib/utils/cad-mesh-placement"
import { getBoundingBoxSize, scaleMesh } from "../../lib/utils/mesh-scale"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("negative uniform scale retains ordered measured bounds for fitting and contact-origin inference", () => {
  const mesh = loadJscadPlan({
    type: "cuboid",
    size: [2, 4, 6],
    center: [3, 5, 7],
  })
  const scaled = scaleMesh(mesh, -2)
  expect(scaled.boundingBox).toEqual({
    min: { x: -8, y: -20, z: -14 },
    max: { x: -4, y: -8, z: -6 },
  })
  expect(getBoundingBoxSize(scaled.boundingBox)).toEqual({ x: 4, y: 12, z: 8 })
  const fitted = fitMeshToCadBounds(
    scaled,
    { x: 2, y: 6, z: 4 },
    "contain_within_bounds",
  )
  expect(getBoundingBoxSize(fitted.boundingBox)).toEqual({ x: 2, y: 6, z: 4 })
  const cad = geometryCircuit({
    model_origin_alignment: "center_of_component_on_board_surface",
  }).find((item) => item.type === "cad_component")
  if (cad?.type !== "cad_component") throw new Error("Missing CAD")
  expect(getMeshOrigin(cad, fitted)).toEqual({ x: -3, y: 0, z: -5 })
  expect(
    fitted.triangles.every((triangle) => triangle.windingReversed === false),
  ).toBe(true)
})
