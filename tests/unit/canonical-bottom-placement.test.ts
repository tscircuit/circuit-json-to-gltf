import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"

test("bottom placement preserves supplied Z and the exporter's OBJ rotation fallback", async () => {
  const model = "v 1 2 3\nv 2 2 3\nv 1 4 3\nf 1 2 3\n"
  for (const z of [0.7, -0.7]) {
    for (const explicitRotation of [false, true]) {
      const circuit: CircuitJson = [
        {
          type: "pcb_board",
          pcb_board_id: "board1",
          center: { x: 0, y: 0 },
          width: 10,
          height: 10,
          thickness: 1.4,
          num_layers: 2,
          material: "fr4",
        },
        {
          type: "pcb_component",
          pcb_component_id: "pcb1",
          source_component_id: "source1",
          center: { x: 0, y: 0 },
          width: 2,
          height: 4,
          rotation: 0,
          layer: "bottom",
          obstructs_within_bounds: true,
        },
        {
          type: "cad_component",
          cad_component_id: "cad1",
          pcb_component_id: "pcb1",
          source_component_id: "source1",
          position: { x: 3, y: 5, z },
          rotation: explicitRotation ? { x: 0, y: 0, z: 0 } : undefined,
          model_obj_url: `data:text/plain;base64,${Buffer.from(model).toString("base64")}`,
          model_object_fit: "contain_within_bounds",
          anchor_alignment: "center",
        },
      ]
      const scene = await convertCircuitJsonTo3D(circuit, {
        renderBoardTextures: false,
      })
      const box = scene.boxes[1]!
      expect(box.center.x).toBe(3)
      expect(box.center.y).toBe(5)
      expect(box.center.z).toBe(z)
      expect(box.rotation).toEqual({
        x: explicitRotation ? 0 : Math.PI,
        y: 0,
        z: 0,
      })
    }
  }
})
