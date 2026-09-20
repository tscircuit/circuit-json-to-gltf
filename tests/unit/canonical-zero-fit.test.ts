import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
import { transformMesh } from "../../lib/gltf/geometry"

test("zero fit targets collapse geometry without aborting the circuit export", async () => {
  for (const fitMode of ["fill_bounds", "contain_within_bounds"] as const) {
    const cad: CadComponent = {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "pcb1",
      source_component_id: "source1",
      position: { x: 1, y: 2, z: 3 },
      model_jscad: { type: "cuboid", size: [2, 2, 2] },
      size: { x: 2, y: 2, z: 0 },
      model_object_fit: fitMode,
      anchor_alignment: "center",
    }
    const scene = await convertCircuitJsonTo3D([cad], {
      renderBoardTextures: false,
    })
    for (const triangle of scene.boxes[0]!.mesh!.triangles) {
      expect(triangle.normal).toEqual({ x: 0, y: 0, z: 0 })
      for (const point of triangle.vertices) {
        expect(Math.abs(point.z)).toBe(0)
        if (fitMode === "contain_within_bounds") {
          expect(Math.hypot(point.x, point.y, point.z)).toBe(0)
        }
      }
    }
    const glb = await convertCircuitJsonToGltf([cad], {
      format: "glb",
      boardTextureResolution: 0,
    })
    expect(glb).toBeInstanceOf(ArrayBuffer)
  }
  const transformed = transformMesh(
    { positions: [1, 2, 3], normals: [0, 0, 1], texcoords: [], indices: [] },
    { x: 7, y: 11, z: 13 },
    { x: 0, y: 0, z: 0 },
    { x: 1, y: 1, z: 0 },
  )
  expect(transformed.positions).toEqual([8, 13, 13])
  expect(transformed.normals).toEqual([0, 0, 0])
})
