import { expect, test } from "bun:test"
import { prepareBoardGeometry } from "../../lib/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("canonical zero origins win over stale metadata and absent facts use explicit supplements", async () => {
  const circuitJson = geometryCircuit({
    model_origin_position: { x: 0, y: 0, z: 0 },
  })
  const canonical = await prepareBoardGeometry({
    circuitJson,
    pcbBoardId: "board",
  })
  const conflict = await prepareBoardGeometry({
    circuitJson,
    pcbBoardId: "board",
    supplementalModelMetadata: {
      byCadComponentId: {
        cad: { model_origin_position: { x: 1, y: 2, z: 3 } },
      },
    },
  })
  expect(conflict.components).toEqual(canonical.components)
  expect(conflict.diagnostics).toEqual([
    {
      cadComponentId: "cad",
      field: "model_origin_position",
      message: "Circuit JSON value takes precedence over supplemental metadata",
    },
  ])
  const supplemented = await prepareBoardGeometry({
    circuitJson: geometryCircuit(),
    pcbBoardId: "board",
    supplementalModelMetadata: {
      byCadComponentId: {
        cad: { model_origin_position: { x: 0, y: 0, z: 0 } },
      },
    },
  })
  expect(supplemented.components).toEqual(canonical.components)
  expect(supplemented.diagnostics).toEqual([])
})
