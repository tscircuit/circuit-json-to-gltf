import { describe, expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"
import { hasBoundaryCrossingLoops } from "../../lib/utils/has-boundary-crossing-loops"
import {
  getPadOverlappingVias,
  splitViaWalls,
} from "../../lib/utils/pad-overlapping-vias"
import { createBoardMesh } from "../../lib/utils/pcb-board-geometry"

describe("polygon/offset pad overlapping vias and concave boundary-crossing loops", () => {
  test("detects vias overlapping clockwise polygon SMT pads and rotated/offset plated-hole pads", () => {
    const circuit: CircuitJson = [
      {
        type: "pcb_smtpad",
        pcb_smtpad_id: "cw_poly_pad",
        pcb_component_id: "comp_1",
        shape: "polygon",
        layer: "top",
        points: [
          { x: 0, y: 0 },
          { x: 0, y: 2 },
          { x: 2, y: 2 },
          { x: 2, y: 0 },
          { x: 0, y: 0 },
        ],
      },
      {
        type: "pcb_via",
        pcb_via_id: "via_cw_poly",
        x: 1,
        y: 1,
        hole_diameter: 0.3,
        outer_diameter: 0.6,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "rotated_poly_ph",
        shape: "hole_with_polygon_pad",
        hole_shape: "circle",
        x: 10,
        y: 0,
        hole_diameter: 0.8,
        hole_offset_x: 0,
        hole_offset_y: 0,
        ccw_rotation: 90,
        pad_outline: [
          { x: -0.5, y: -0.5 },
          { x: 2.5, y: -0.5 },
          { x: 2.5, y: 0.5 },
          { x: -0.5, y: 0.5 },
        ],
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_via",
        pcb_via_id: "via_rotated_poly_ph",
        x: 10,
        y: 2,
        hole_diameter: 0.3,
        outer_diameter: 0.6,
        layers: ["top", "bottom"],
      },
      {
        type: "pcb_plated_hole",
        pcb_plated_hole_id: "offset_rect_ph",
        shape: "circular_hole_with_rect_pad",
        x: 20,
        y: 0,
        hole_diameter: 0.8,
        rect_pad_width: 1.6,
        rect_pad_height: 1.6,
        rect_pad_x_offset: 2,
        rect_pad_y_offset: 0,
        layers: ["top", "bottom"],
      } as any,
      {
        type: "pcb_via",
        pcb_via_id: "via_offset_rect_ph",
        x: 22,
        y: 0,
        hole_diameter: 0.3,
        outer_diameter: 0.6,
        layers: ["top", "bottom"],
      },
    ]

    const overlappingIds = getPadOverlappingVias(circuit).map(
      (via) => via.pcb_via_id,
    )
    expect(overlappingIds).toEqual([
      "via_cw_poly",
      "via_rotated_poly_ph",
      "via_offset_rect_ph",
    ])
  })

  test("splitViaWalls recomputes copper and board bounding boxes from their triangles", async () => {
    const emptySplit = splitViaWalls(
      {
        triangles: [],
        boundingBox: {
          min: { x: -10, y: -1, z: -10 },
          max: { x: 10, y: 1, z: 10 },
        },
      },
      { x: 0, y: 0 },
      [],
    )
    expect(emptySplit.copper.boundingBox).toEqual({
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    })

    const scene = await convertCircuitJsonTo3D(
      [
        {
          type: "pcb_board",
          pcb_board_id: "board_1",
          center: { x: 0, y: 0 },
          width: 20,
          height: 20,
          thickness: 1.6,
          num_layers: 2,
          material: "fr4",
        },
        {
          type: "pcb_smtpad",
          pcb_smtpad_id: "pad_1",
          shape: "polygon",
          layer: "top",
          points: [
            { x: 4, y: 4 },
            { x: 4, y: 6 },
            { x: 6, y: 6 },
            { x: 6, y: 4 },
          ],
        },
        {
          type: "pcb_via",
          pcb_via_id: "via_1",
          x: 5,
          y: 5,
          hole_diameter: 0.6,
          outer_diameter: 1.0,
          layers: ["top", "bottom"],
        },
      ] as any,
      { renderBoardTextures: false },
    )

    const copper = scene.boxes.find((b) => b.label === "Via Plating")!
    expect(copper).toBeDefined()
    expect(copper.mesh!.boundingBox.min.x).toBeGreaterThan(4.5)
    expect(copper.mesh!.boundingBox.max.x).toBeLessThan(5.5)
    expect(copper.mesh!.boundingBox.min.z).toBeGreaterThan(4.5)
    expect(copper.mesh!.boundingBox.max.z).toBeLessThan(5.5)
  })

  test("hasBoundaryCrossingLoops detects inner loops crossing concave board outline notches", () => {
    // U-shaped outer loop with a notch from x=-2..2, y=0..4
    const outerLoop = [
      { x: -5, y: -5 },
      { x: 5, y: -5 },
      { x: 5, y: 5 },
      { x: 2, y: 5 },
      { x: 2, y: 0 },
      { x: -2, y: 0 },
      { x: -2, y: 5 },
      { x: -5, y: 5 },
    ]
    // Cutout whose 4 corners are strictly inside the left and right arms of the U,
    // while its top/bottom edges cross the notch at x=-2..2, y=1..3
    const bridgingCutout = [
      { x: -4, y: 1 },
      { x: 4, y: 1 },
      { x: 4, y: 3 },
      { x: -4, y: 3 },
    ]

    expect(hasBoundaryCrossingLoops(outerLoop, [bridgingCutout])).toBe(true)

    const boardMesh = createBoardMesh(
      {
        type: "pcb_board",
        pcb_board_id: "u_board",
        center: { x: 0, y: 0 },
        width: 10,
        height: 10,
        thickness: 1.6,
        num_layers: 2,
        material: "fr4",
        outline: outerLoop,
      },
      {
        thickness: 1.6,
        cutouts: [
          {
            type: "pcb_cutout",
            pcb_cutout_id: "bridge_cutout",
            shape: "rect",
            center: { x: 0, y: 2 },
            width: 8,
            height: 2,
          },
        ],
      },
    )

    // In the notch region (x = 0, z = 2 in board-local Scene3D), boolean subtraction
    // ensures no top/bottom face triangle bridges across the empty notch.
    const coversNotchCenter = boardMesh.triangles.some((t) => {
      if (Math.abs(t.normal.y) < 0.9) return false
      const x = 0
      const z = 2
      const signs = t.vertices.map((a, i) => {
        const b = t.vertices[(i + 1) % 3]!
        return (b.x - a.x) * (z - a.z) - (b.z - a.z) * (x - a.x)
      })
      return signs.every((s) => s >= -1e-8) || signs.every((s) => s <= 1e-8)
    })
    expect(coversNotchCenter).toBe(false)
  })
})
