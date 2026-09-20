import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

test("OBJ local geometry stays canonical until XYZ world placement and final GLB export", async () => {
  const model = "v 1 2 3\nv 2 2 3\nv 1 4 3\nf 1 2 3\n"
  const rotated = [
    [0.8759159615573968, 0.766903405514455, 3.5559289074585436],
    [1.460502654935436, 1.5773643478311188, 3.5183595195940187],
    [-0.377868994993408, 1.7281117088345683, 4.782347221230547],
  ]
  for (const layer of ["top", "bottom"] as const) {
    const circuit: CircuitJson = [
      {
        type: "pcb_component",
        pcb_component_id: "pcb1",
        source_component_id: "source1",
        center: { x: 7, y: -11 },
        width: 2,
        height: 4,
        rotation: 0,
        layer,
        obstructs_within_bounds: true,
      },
      {
        type: "cad_component",
        cad_component_id: "cad1",
        pcb_component_id: "pcb1",
        source_component_id: "source1",
        position: { x: 7, y: -11, z: layer === "top" ? 3 : -3 },
        rotation: { x: 23, y: 31, z: 47 },
        model_obj_url: `data:text/plain;base64,${Buffer.from(model).toString("base64")}`,
        model_origin_position: { x: 0, y: 0, z: 0 },
        model_object_fit: "contain_within_bounds",
        anchor_alignment: "center",
      },
    ]
    const scene = await convertCircuitJsonTo3D(circuit, {
      renderBoardTextures: false,
    })
    expect(scene.boxes[0]!.mesh!.triangles[0]!.vertices).toEqual([
      { x: 1, y: 2, z: 3 },
      { x: 2, y: 2, z: 3 },
      { x: 1, y: 4, z: 3 },
    ])
    expect(scene.boxes[0]!.center).toEqual({
      x: 7,
      y: -11,
      z: layer === "top" ? 3 : -3,
    })
    const glb = await convertCircuitJsonToGltf(circuit, {
      format: "glb",
      boardTextureResolution: 0,
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
    const triangles = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY).triangles
    expect(triangles).toHaveLength(1)
    for (const [index, vertex] of triangles[0]!.vertices.entries()) {
      const expected = rotated[index]!
      // Only this final boundary maps P -> G=(-P.x,P.z,P.y).
      expect(vertex.x).toBeCloseTo(-(7 + expected[0]!), 5)
      expect(vertex.y).toBeCloseTo((layer === "top" ? 3 : -3) + expected[2]!, 5)
      expect(vertex.z).toBeCloseTo(-11 + expected[1]!, 5)
    }
  }
})
