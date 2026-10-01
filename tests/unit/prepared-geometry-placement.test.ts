import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { prepareBoardGeometry } from "../../lib/geometry"
import { createMeshFromSTL, transformMesh } from "../../lib/gltf/geometry"
import { geometryCircuit } from "../fixtures/geometry-circuit"

test("prepared actual vertices match exporter placement for every normal, fit, layer and a large world offset", async () => {
  for (const normal of ["x+", "x-", "y+", "y-", "z+", "z-"] as const) {
    for (const fit of ["contain_within_bounds", "fill_bounds"] as const) {
      for (const layer of ["top", "bottom"] as const) {
        const circuit = geometryCircuit({
          model_board_normal_direction: normal,
          model_object_fit: fit,
          model_unit_to_mm_scale_factor: 0.125,
          model_origin_position: { x: 0.25, y: -0.5, z: 0.125 },
          size: { x: 3, y: 5, z: 7 },
          rotation: { x: 23, y: -37, z: 61 },
          position: { x: 1e9 + 0.125, y: -1e9 + 0.25, z: 1.125 },
        })
        const board = circuit.find((item) => item.type === "pcb_board")!
        if (board.type !== "pcb_board") throw new Error("Missing board")
        board.center = { x: 1e9, y: -1e9 }
        const pcb = circuit.find((item) => item.type === "pcb_component")!
        if (pcb.type !== "pcb_component") throw new Error("Missing PCB")
        pcb.layer = layer
        const prepared = await prepareBoardGeometry({
          circuitJson: circuit,
          pcbBoardId: "board",
        })
        const body = prepared.components[0]!
        if (body.status !== "available") throw new Error(body.reason)
        const scene = await convertCircuitJsonTo3D(circuit, {
          renderBoardTextures: false,
        })
        const box = scene.boxes[1]!
        expect(body.mesh).toEqual(box.mesh!)
        const reference = transformMesh(
          createMeshFromSTL(box.mesh!),
          {
            x: box.center.x - board.center.x,
            y: box.center.y,
            z: box.center.z - board.center.y,
          },
          box.rotation,
        ).positions
        const m = body.boardFromMesh
        const actual = body.mesh.triangles.flatMap((t) =>
          t.vertices.map((v) => [
            m[0] * v.x + m[4] * v.y + m[8] * v.z + m[12],
            m[1] * v.x + m[5] * v.y + m[9] * v.z + m[13],
            m[2] * v.x + m[6] * v.y + m[10] * v.z + m[14],
          ]),
        )
        for (const [i, point] of actual.entries()) {
          expect(point[0]).toBeCloseTo(reference[i * 3]!, 12)
          expect(point[1]).toBeCloseTo(reference[i * 3 + 2]!, 12)
          expect(point[2]).toBeCloseTo(reference[i * 3 + 1]!, 12)
        }
        expect(body.bounds.min.x).toBe(Math.min(...actual.map((v) => v[0]!)))
        expect(body.bounds.max.z).toBe(Math.max(...actual.map((v) => v[2]!)))
        expect(body.topology).toBe("unchecked")
      }
    }
  }
})
