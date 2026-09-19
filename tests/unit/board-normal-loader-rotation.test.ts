import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

test.each([
  ["oblique", { x: 17, y: 31, z: 43 }],
  ["small", { x: 0.01, y: 0, z: 0 }],
] as const)(
  "%s loader rotation does not change the meaning of native z+",
  async (_name, rotation) => {
    const cad: CadComponent = {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      position: { x: 0, y: 0, z: 0 },
      model_stl_url: "tests/assets/native-normal-tetrahedron.stl",
      model_origin_position: { x: 0, y: 0, z: 0 },
      model_board_normal_direction: "z+",
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
    }
    const glb = await convertCircuitJsonToGltf([cad], {
      format: "glb",
      boardTextureResolution: 0,
      coordinateTransform: { rotation },
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB")
    const mesh = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
    const marker = mesh.triangles
      .flatMap((triangle) => triangle.vertices)
      .find(
        (point) => Math.abs(Math.hypot(point.x, point.y, point.z) - 7) < 1e-5,
      )
    if (!marker) throw new Error("Missing native +Z marker")
    expect(marker.x).toBeCloseTo(0, 5)
    expect(marker.y).toBeCloseTo(7, 5)
    expect(marker.z).toBeCloseTo(0, 5)
  },
)
