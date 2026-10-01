import { expect, test } from "bun:test"
import type { Box3D } from "../../lib/types"
import { tryFoldRigidBox } from "../../lib/utils/fold-rigid-box"
import { createPcbFold, tryFoldBoardMesh } from "../../lib/utils/pcb-fold"

test("unexpected fold failures propagate through the GLTF frame adapters", () => {
  const failure = new Error("Unexpected transform failure")
  const fold = {
    ...createPcbFold(
      [
        {
          type: "pcb_bend",
          pcb_bend_id: "bend",
          pcb_board_id: "board",
          start: { x: 0, y: -10 },
          end: { x: 0, y: 10 },
          bend_angle: 90,
          bend_radius: 1,
          bend_side: "right",
        },
      ],
      0.12,
    ),
    point() {
      throw failure
    },
  }
  const box: Box3D = {
    center: { x: 8, y: 0.4, z: 2 },
    size: { x: 2, y: 0.6, z: 1 },
  }
  expect(() => tryFoldRigidBox(box, fold, { x: 0, y: 0 })).toThrow(failure)
  expect(() =>
    tryFoldBoardMesh(
      {
        triangles: [
          {
            vertices: [
              { x: 7, y: 0.06, z: 1 },
              { x: 9, y: 0.06, z: 1 },
              { x: 8, y: 0.06, z: 3 },
            ],
            normal: { x: 0, y: 1, z: 0 },
          },
        ],
        boundingBox: {
          min: { x: 7, y: 0.06, z: 1 },
          max: { x: 9, y: 0.06, z: 3 },
        },
      },
      fold,
    ),
  ).toThrow(failure)
})
