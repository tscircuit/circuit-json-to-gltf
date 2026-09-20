import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

test.each(["x+", "x-", "y+", "y-", "z+", "z-"] as const)(
  "%s keeps the explicit native model datum at the CAD anchor",
  async (direction) => {
    const cad: CadComponent = {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      position: { x: 7, y: -11, z: 5 },
      rotation: { x: 0, y: 0, z: 0 },
      model_stl_url: "tests/assets/native-normal-tetrahedron.stl",
      // This is an actual vertex of the native asset, not its bounds center.
      model_origin_position: { x: 0, y: 5, z: 0 },
      model_board_normal_direction: direction,
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
    }
    const glb = await convertCircuitJsonToGltf([cad], {
      format: "glb",
      boardTextureResolution: 0,
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB")
    const mesh = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
    const anchors = mesh.triangles
      .flatMap((triangle) => triangle.vertices)
      .filter(
        (point) =>
          Math.abs(point.x + 7) < 1e-5 &&
          Math.abs(point.y - 5) < 1e-5 &&
          Math.abs(point.z + 11) < 1e-5,
      )
    expect(anchors.length).toBeGreaterThan(0)
  },
)
