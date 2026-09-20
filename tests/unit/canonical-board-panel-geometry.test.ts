import { expect, test } from "bun:test"
import * as vec3 from "@jscad/modeling/src/maths/vec3"
import type { PcbBoard } from "circuit-json"
import {
  createBoardMesh,
  type BoardGeometryOptions,
} from "../../lib/utils/pcb-board-geometry"
import { createPanelMesh } from "../../lib/utils/pcb-panel-geometry"

test.each([
  ["board", false],
  ["board", true],
  ["panel", false],
  ["panel", true],
] as const)(
  "%s is canonical Z-up with off-center holes and cutouts (edge clipping: %s)",
  (kind, clipped) => {
    const board = {
      type: "pcb_board",
      pcb_board_id: "asymmetric",
      center: { x: 11, y: -7 },
      width: 12,
      height: 9,
      thickness: 1.4,
      num_layers: 2,
      material: "fr4",
      outline: [
        { x: 6, y: -10 },
        { x: 18, y: -10 },
        { x: 18, y: -3 },
        { x: 13, y: -1 },
        { x: 6, y: -5 },
      ],
    } satisfies PcbBoard
    const offsetHole = {
      type: "pcb_plated_hole" as const,
      pcb_plated_hole_id: "offset",
      x: 9,
      y: -8,
      hole_offset_x: 0.5,
      hole_offset_y: 0.25,
      shape: "circle" as const,
      hole_diameter: 0.6,
      outer_diameter: 1,
      layers: ["top" as const, "bottom" as const],
    }
    const options: BoardGeometryOptions = {
      thickness: 1.4,
      holes: [
        {
          type: "pcb_hole",
          pcb_hole_id: "drilled",
          x: 14,
          y: -5,
          hole_shape: "circle",
          hole_diameter: 1,
        },
      ],
      platedHoles: [offsetHole],
      cutouts: [
        {
          type: "pcb_cutout",
          pcb_cutout_id: "rotated",
          shape: "rect",
          center: { x: 14, y: -8 },
          width: 2,
          height: 0.8,
          rotation: 30,
        },
        {
          type: "pcb_cutout",
          pcb_cutout_id: "polygon",
          shape: "polygon",
          points: [
            { x: 9, y: -5 },
            { x: 10, y: -5 },
            { x: 10, y: -4 },
          ],
        },
        ...(clipped
          ? [
              {
                type: "pcb_cutout" as const,
                pcb_cutout_id: "edge",
                shape: "rect" as const,
                center: { x: 18, y: -7 },
                width: 2,
                height: 1,
              },
            ]
          : []),
      ],
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

    expect(mesh.boundingBox.min.x).toBeCloseTo(-5, 8)
    expect(mesh.boundingBox.min.y).toBeCloseTo(-3, 8)
    expect(mesh.boundingBox.min.z).toBeCloseTo(-0.7, 8)
    expect(mesh.boundingBox.max.x).toBeCloseTo(7, 8)
    expect(mesh.boundingBox.max.y).toBeCloseTo(6, 8)
    expect(mesh.boundingBox.max.z).toBeCloseTo(0.7, 8)

    const vertices = mesh.triangles.flatMap((triangle) => triangle.vertices)
    // Explicit local landmarks distinguish Y reflection, axis swaps, and recentering.
    for (const [x, y] of [
      [2, 6],
      [-5, 2],
      [-2, 2],
      [-1, 3],
      [3.5, 2],
      [-1.2, -0.75],
      [3 + Math.sqrt(3) / 2 - 0.2, -0.5 + Math.sqrt(3) / 5],
      ...(clipped
        ? [
            [6, -0.5],
            [6, 0.5],
          ]
        : []),
    ]) {
      for (const z of [-0.7, 0.7]) {
        expect(
          vertices.some(
            (p) =>
              Math.abs(p.x - x!) < 1e-7 &&
              Math.abs(p.y - y!) < 1e-7 &&
              Math.abs(p.z - z) < 1e-7,
          ),
        ).toBe(true)
      }
    }

    let topArea = 0
    let bottomArea = 0
    for (const {
      vertices: [a, b, c],
      normal,
    } of mesh.triangles) {
      const ab = vec3.fromValues(b.x - a.x, b.y - a.y, b.z - a.z)
      const ac = vec3.fromValues(c.x - a.x, c.y - a.y, c.z - a.z)
      const cross = vec3.cross(vec3.create(), ab, ac)
      const magnitude = vec3.length(cross)
      if (magnitude < 1e-10) continue
      const direction = vec3.normalize(vec3.create(), cross)
      expect(direction[0]).toBeCloseTo(normal.x, 7)
      expect(direction[1]).toBeCloseTo(normal.y, 7)
      expect(direction[2]).toBeCloseTo(normal.z, 7)
      if (normal.z > 0.9) {
        expect(a.z).toBeCloseTo(0.7, 7)
        topArea += magnitude / 2
      } else if (normal.z < -0.9) {
        expect(a.z).toBeCloseTo(-0.7, 7)
        bottomArea += magnitude / 2
      }
    }
    const expectedArea = 89 - Math.PI * 0.34 - 1.6 - 0.5 - (clipped ? 1 : 0)
    expect(Math.abs(topArea - expectedArea)).toBeLessThan(0.02)
    expect(bottomArea).toBeCloseTo(topArea, 7)

    for (const [x, y, radius] of [
      [3, 2, 0.5],
      [-1.5, -0.75, 0.3],
    ]) {
      const walls = mesh.triangles.filter(
        (triangle) =>
          Math.abs(triangle.normal.z) < 1e-7 &&
          triangle.vertices.every(
            (p) => Math.abs(Math.hypot(p.x - x!, p.y - y!) - radius!) < 1e-7,
          ),
      )
      expect(walls.length).toBeGreaterThan(0)
      for (const {
        vertices: [a],
        normal,
      } of walls) {
        expect((x! - a.x) * normal.x + (y! - a.y) * normal.y).toBeGreaterThan(0)
      }
    }
    const leftWalls = mesh.triangles.filter((triangle) =>
      triangle.vertices.every((p) => Math.abs(p.x + 5) < 1e-7),
    )
    expect(leftWalls.length).toBeGreaterThan(0)
    for (const { normal } of leftWalls) expect(normal.x).toBeCloseTo(-1, 7)
  },
)
