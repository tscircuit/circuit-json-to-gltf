import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { parseGLB } from "../../lib/loaders/glb"
import { applyCoordinateTransform } from "../../lib/utils/coordinate-transform"
import { getDefaultModelTransform } from "../../lib/utils/get-default-model-transform"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test("GLB default normalization is explicit and independent of native board-normal declarations", () => {
  const { glb } = createGLTFAsset()
  const cad: CadComponent = {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    position: { x: 0, y: 0, z: 0 },
    model_origin_position: { x: 1, y: 2, z: 3 },
    model_object_fit: "contain_within_bounds",
    anchor_alignment: "center",
  }
  const options = {
    usingGlbCoordinates: true,
    usingObjFormat: false,
    usingStepFormat: false,
    hasFootprinterModel: false,
  }
  const defaultMesh = parseGLB(glb)
  expect(defaultMesh.triangles[0]!.vertices).toEqual([
    { x: 1, y: 2, z: 3 },
    { x: 2, y: 2, z: 3 },
    { x: 1, y: 3, z: 4 },
  ])
  for (const direction of [
    undefined,
    "x+",
    "x-",
    "y+",
    "y-",
    "z+",
    "z-",
  ] as const) {
    const transform = getDefaultModelTransform(
      { ...cad, model_board_normal_direction: direction },
      options,
    )
    expect(parseGLB(glb, transform)).toEqual(defaultMesh)
    expect(
      applyCoordinateTransform(cad.model_origin_position!, transform),
    ).toEqual({ x: 1, y: 2, z: 3 })
  }
  const coordinateTransform = {
    axisMapping: { x: "-x", y: "y", z: "z" },
  } as const
  expect(
    getDefaultModelTransform(cad, { ...options, coordinateTransform }),
  ).toBe(coordinateTransform)
})
