import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createGLTFAsset } from "../fixtures/gltf-asset"

test.each(["model_glb_url", "model_gltf_url"] as const)(
  "%s shares its default loader mapping with native normals and origins",
  async (field) => {
    const { glb } = createGLTFAsset({
      positions: [1, 2, 3, 1, 2, 10, 4, 7, 3],
      graph: { scenes: [{ nodes: [0] }], nodes: [{ mesh: 0 }] },
    })
    const cad: CadComponent = {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      position: { x: 7, y: -11, z: 5 },
      [field]: `data:model/gltf-binary;base64,${Buffer.from(glb).toString("base64")}`,
      model_origin_position: { x: 1, y: 2, z: 3 },
      model_board_normal_direction: "z+",
      model_object_fit: "contain_within_bounds",
      anchor_alignment: "center",
    }
    const result = await convertCircuitJsonToGltf([cad], {
      format: "glb",
      boardTextureResolution: 0,
    })
    if (!(result instanceof ArrayBuffer)) throw new Error("Expected GLB")
    const vertices = parseGLB(
      result,
      COORDINATE_TRANSFORMS.IDENTITY,
    ).triangles.flatMap((triangle) => triangle.vertices)
    // The datum is at the CAD anchor, and native +Z extends along final +Y.
    expect(vertices).toContainEqual({ x: -7, y: 5, z: -11 })
    expect(vertices).toContainEqual({ x: -7, y: 12, z: -11 })
    expect(vertices).toContainEqual({ x: -10, y: 5, z: -6 })
  },
)
