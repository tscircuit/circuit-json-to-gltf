import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import * as vec3 from "@jscad/modeling/src/maths/vec3"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

test.each(["x+", "x-", "y+", "y-", "z+", "z-"] as const)(
  "%s means the native STL axis, and normalization does not mirror the model",
  async (direction) => {
    const cad: CadComponent = {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      model_stl_url: "tests/assets/native-normal-tetrahedron.stl",
      model_origin_position: { x: 0, y: 0, z: 0 },
      model_board_normal_direction: direction,
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
    }
    const glb = await convertCircuitJsonToGltf([cad], {
      format: "glb",
      boardTextureResolution: 0,
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB")
    const triangles = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY).triangles
    expect(triangles).toHaveLength(4)
    const points = triangles.flatMap((triangle) =>
      triangle.vertices.map((p) => vec3.fromValues(-p.x, p.z, p.y)),
    )
    // Distinct native axis lengths identify the markers without depending on
    // vertex order, winding or the implementation's rotation matrix.
    const axes = [3, 5, 7].map((length) => {
      const marker = points.find(
        (point) => Math.abs(vec3.length(point) - length) < 1e-5,
      )
      if (!marker)
        throw new Error(`Missing native axis marker of length ${length}`)
      return vec3.scale(vec3.create(), marker, 1 / length)
    })
    const axisIndex = { x: 0, y: 1, z: 2 }[direction[0] as "x" | "y" | "z"]
    const normal = vec3.scale(
      vec3.create(),
      axes[axisIndex]!,
      direction.endsWith("+") ? 1 : -1,
    )
    expect(normal[0]).toBeCloseTo(0, 6)
    expect(normal[1]).toBeCloseTo(0, 6)
    expect(normal[2]).toBeCloseTo(1, 6)
    expect(
      vec3.dot(vec3.cross(vec3.create(), axes[0]!, axes[1]!), axes[2]!),
    ).toBeCloseTo(1, 6)
  },
)
