import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

test("canonical operation order retains the exporter's unit-scaled target size", async () => {
  const model = "v 4 5 6\nv 6 5 6\nv 4 9 14\nf 1 2 3\n"
  const circuit: CircuitJson = [
    {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      model_obj_url: `data:text/plain;base64,${Buffer.from(model).toString("base64")}`,
      model_unit_to_mm_scale_factor: 2,
      model_board_normal_direction: "y+",
      model_origin_position: { x: 1, y: 2, z: 3 },
      model_object_fit: "fill_bounds",
      size: { x: 20, y: 8, z: 24 },
      rotation: { x: 23, y: 31, z: 47 },
      position: { x: 7, y: -11, z: 3 },
      anchor_alignment: "center",
    },
  ]
  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })
  // (4,5,6) -> units (8,10,12) -> Rx(90) (8,-12,10)
  // -> subtract Rx(90)*(1,2,3) => (7,-9,8)
  // -> target size (40,16,48), fit scales (10,1,6) => (70,-9,48).
  const marker = scene.boxes[0]!.mesh!.triangles[0]!.vertices[0]
  expect(marker.x).toBeCloseTo(70, 10)
  expect(marker.y).toBeCloseTo(-9, 10)
  expect(marker.z).toBeCloseTo(48, 10)
  const glb = await convertCircuitJsonToGltf(circuit, {
    format: "glb",
    boardTextureResolution: 0,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB")
  const point = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY).triangles[0]!
    .vertices[0]
  // Independently calculated with Three Euler(23,31,47,"XYZ") and position.
  expect(point.x).toBeCloseTo(-78.28492843662397, 5)
  expect(point.y).toBeCloseTo(32.72454014232625, 5)
  expect(point.z).toBeCloseTo(25.33057515526881, 5)
})
