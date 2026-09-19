import { expect, test } from "bun:test"
import * as modeling from "@jscad/modeling"
import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import { getJscadModelForFootprint } from "jscad-electronics/vanilla"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { geom3ToTriangles } from "../../lib/utils/pcb-board-geometry"

test("footprinter retains native axes and applies the exporter's explicit origin policy", async () => {
  const native = getJscadModelForFootprint("soic8", modeling)!
  const bounds = boundsOfTriangles(
    native.geometries.flatMap(({ geom }) =>
      geom3ToTriangles(geom, geom3.toPolygons(geom)),
    ),
  )
  const circuit: CircuitJson = [
    {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      footprinter_string: "soic8",
      position: { x: 2, y: -3, z: 4 },
      rotation: { x: 23, y: 31, z: 47 },
      model_unit_to_mm_scale_factor: 2,
      model_origin_position: { x: 1, y: 2, z: 3 },
      model_object_fit: "fill_bounds",
      anchor_alignment: "center",
    },
  ]
  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })
  const box = scene.boxes[0]!
  expect(box.center).toEqual({ x: 2, y: -3, z: 4 })
  const origin = { x: 1, y: 2, z: 3 }
  for (const axis of ["x", "y", "z"] as const) {
    expect(box.mesh!.boundingBox.min[axis]).toBeCloseTo(
      bounds.min[axis] * 2 - origin[axis],
      5,
    )
    expect(box.mesh!.boundingBox.max[axis]).toBeCloseTo(
      bounds.max[axis] * 2 - origin[axis],
      5,
    )
  }
})
