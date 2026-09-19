import { expect, test } from "bun:test"
import type { PcbBoard } from "circuit-json"
import {
  createBoardMesh,
  type BoardGeometryOptions,
} from "../../lib/utils/pcb-board-geometry"
import { createPanelMesh } from "../../lib/utils/pcb-panel-geometry"

test.each(["board", "panel"])(
  "%s drilling preserves Circuit JSON CCW rotations about +Z",
  (kind) => {
    const board = {
      type: "pcb_board",
      pcb_board_id: "rotated-drilling",
      center: { x: 11, y: -7 },
      width: 20,
      height: 14,
      thickness: 1.4,
      num_layers: 2,
      material: "fr4",
    } satisfies PcbBoard
    const rotatedOval = {
      type: "pcb_plated_hole" as const,
      pcb_plated_hole_id: "oval",
      x: 8,
      y: -9,
      shape: "oval" as const,
      hole_width: 2,
      hole_height: 0.8,
      outer_width: 3,
      outer_height: 1.8,
      ccw_rotation: -30,
      layers: ["top" as const, "bottom" as const],
    }
    const options: BoardGeometryOptions = {
      thickness: 1.4,
      holes: [
        {
          type: "pcb_hole",
          pcb_hole_id: "pill",
          hole_shape: "rotated_pill",
          x: 13,
          y: -6,
          hole_width: 4,
          hole_height: 1,
          ccw_rotation: 30,
        },
      ],
      platedHoles: [rotatedOval],
    }
    const mesh =
      kind === "board"
        ? createBoardMesh(board, options)
        : createPanelMesh(
            {
              ...board,
              type: "pcb_panel",
              pcb_panel_id: "panel",
              covered_with_solder_mask: true,
            },
            options,
          )
    const vertices = mesh.triangles.flatMap((triangle) => triangle.vertices)
    for (const [x, y] of [
      [2 + Math.sqrt(3), 2],
      [2 - Math.sqrt(3), 0],
      [-3 + Math.sqrt(3) / 2, -2.5],
      [-3 - Math.sqrt(3) / 2, -1.5],
    ]) {
      for (const z of [-0.7, 0.7]) {
        expect(
          vertices.some(
            (p) =>
              Math.abs(p.x - x!) < 0.001 &&
              Math.abs(p.y - y!) < 0.001 &&
              Math.abs(p.z - z) < 1e-7,
          ),
        ).toBe(true)
      }
    }
  },
)
