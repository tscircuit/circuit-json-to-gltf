import { expect, test } from "bun:test"
import { createExplosionLines } from "../../lib/converters/explosion-lines"
import { createReferenceSurfaceBox } from "../../lib/converters/reference-surface"
import { loadCable } from "../../lib/loaders/cable"
import type { Box3D } from "../../lib/types"
import { buildBoardMeshFromLoops } from "../../lib/utils/triangles-from-loops"

test("buildBoardMeshFromLoops strips duplicate vertices and guards degenerate thickness or loops", () => {
  expect(
    buildBoardMeshFromLoops({
      outerLoop: [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      holeLoops: [],
      thickness: 0,
    }).triangles,
  ).toHaveLength(0)

  const mesh = buildBoardMeshFromLoops({
    outerLoop: [
      { x: 0, y: 0 },
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
      { x: 0, y: 10 },
      { x: 0, y: 0 },
    ],
    holeLoops: [
      [
        { x: 2, y: 2 },
        { x: 2, y: 2 },
        { x: 4, y: 2 },
        { x: 4, y: 4 },
        { x: 2, y: 4 },
        { x: 2, y: 2 },
      ],
    ],
    thickness: 1.6,
  })

  expect(mesh.triangles.length).toBeGreaterThan(0)
  for (const tri of mesh.triangles) {
    const nLen = Math.hypot(tri.normal.x, tri.normal.y, tri.normal.z)
    expect(nLen).toBeCloseTo(1, 5)
  }
})

test("createExplosionLines ignores empty triangle meshes and clamps populated off-origin meshes", () => {
  const emptyMeshTarget: Box3D = {
    center: { x: 5, y: 0, z: 0 },
    size: { x: 2, y: 2, z: 2 },
    componentMetadata: {
      cad_component_id: "cad_empty",
      pcb_component_id: "pcb_empty",
    },
    mesh: {
      triangles: [],
      boundingBox: {
        min: { x: 10, y: 10, z: 10 },
        max: { x: 12, y: 12, z: 12 },
      },
    },
  }

  const lines = createExplosionLines(
    [
      {
        stageRef: "stage1",
        targetRef: "cad_empty",
        points: [
          { x: 5, y: 6, z: 7 },
          { x: 5, y: 6, z: 17 },
        ],
      },
    ],
    [emptyMeshTarget],
  )

  expect(lines[0]?.points[0]).toEqual({ x: 5, y: 7, z: 6 })
})

test("loadCable handles duplicate endpoint path samples and non-finite pin1 positions", () => {
  const boxes = loadCable({
    type: "cad_cable",
    cad_cable_id: "cable_1",
    from_source_component_id: "src_from",
    to_source_component_id: "src_to",
    name: "CBL1",
    cableprinter_string: "usb_c",
    path: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 0 },
      { x: 20, y: 0, z: 0 },
      { x: 20, y: 0, z: 0 },
    ],
    from_connector_pin1_position: { x: 0, y: 1, z: 0 },
    to_connector_pin1_position: { x: Number.NaN, y: 1, z: 0 },
  })

  expect(boxes.length).toBeGreaterThan(0)
  for (const box of boxes) {
    for (const tri of box.mesh!.triangles) {
      for (const v of tri.vertices) {
        expect(Number.isFinite(v.x)).toBe(true)
        expect(Number.isFinite(v.y)).toBe(true)
        expect(Number.isFinite(v.z)).toBe(true)
      }
    }
  }
})

test("createReferenceSurfaceBox normalizes non-unit normal and x_axis vectors", () => {
  const box = createReferenceSurfaceBox(
    {
      type: "cad_reference_surface",
      cad_reference_surface_id: "surf_1",
      source_component_id: "src_1",
      name: "top_ref",
      shape: "rect",
      center: { x: 0, y: 0, z: 0 },
      normal: { x: 0, y: 0, z: 5 },
      x_axis: { x: 3, y: 0, z: 0 },
      width: 10,
      height: 6,
    },
    "MOD",
  )

  const planeVertices = box
    .mesh!.triangles.slice(0, 2)
    .flatMap((t) => t.vertices)
  const spanX =
    Math.max(...planeVertices.map((v) => v.x)) -
    Math.min(...planeVertices.map((v) => v.x))
  const spanZ =
    Math.max(...planeVertices.map((v) => v.z)) -
    Math.min(...planeVertices.map((v) => v.z))

  expect(spanX).toBeCloseTo(10, 5)
  expect(spanZ).toBeCloseTo(6, 5)
})
