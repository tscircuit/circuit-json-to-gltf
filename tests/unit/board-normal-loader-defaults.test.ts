import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { getMeshWithBoardNormalTransform } from "../../lib/utils/cad-mesh-placement"
import { applyCoordinateTransform } from "../../lib/utils/coordinate-transform"
import { getDefaultModelTransform } from "../../lib/utils/get-default-model-transform"

test("native declarations retain each format's loader mapping and absence is identity", () => {
  const cad: CadComponent = {
    type: "cad_component",
    cad_component_id: "cad1",
    pcb_component_id: "pcb1",
    source_component_id: "source1",
    position: { x: 0, y: 0, z: 0 },
    model_object_fit: "contain_within_bounds",
    anchor_alignment: "center",
  }
  const mesh = {
    triangles: [],
    boundingBox: { min: { x: 1, y: 2, z: 3 }, max: { x: 4, y: 5, z: 6 } },
  }
  for (const format of ["stl", "obj", "step", "footprinter", "glb"]) {
    const options = {
      usingGlbCoordinates: format === "glb",
      usingObjFormat: format === "obj",
      usingStepFormat: format === "step",
      hasFootprinterModel: format === "footprinter",
    }
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
      const mapped = applyCoordinateTransform(
        { x: 2, y: 3, z: 5 },
        transform ?? {},
      )
      expect(mapped.x).toBeCloseTo(2, 10)
      expect(mapped.y).toBeCloseTo(format === "stl" ? -5 : 5, 10)
      expect(mapped.z).toBeCloseTo(format === "stl" ? -3 : 3, 10)
      expect(getMeshWithBoardNormalTransform(mesh, undefined, transform)).toBe(
        mesh,
      )
    }
    const coordinateTransform = { rotation: { x: 17, y: 31, z: 43 } }
    expect(
      getDefaultModelTransform(cad, { ...options, coordinateTransform }),
    ).toBe(coordinateTransform)
  }
})
