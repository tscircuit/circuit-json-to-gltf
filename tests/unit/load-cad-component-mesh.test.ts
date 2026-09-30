import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import { loadCadComponentMesh } from "../../lib"

const cad: CadComponent = {
  type: "cad_component",
  cad_component_id: "cad_component_test",
  source_component_id: "source_component_test",
  position: { x: 10, y: 20, z: 30 },
  model_jscad: { type: "cuboid", size: [2, 4, 6], center: [3, 5, 7] },
  model_origin_alignment: "unknown",
  anchor_alignment: "center",
  model_object_fit: "contain_within_bounds",
}

function bounds(positions: number[]) {
  return [0, 1, 2].map((axis) => {
    const values = positions.filter((_, i) => i % 3 === axis)
    return [Math.min(...values), Math.max(...values)]
  })
}

test("placed JSCAD triangles are Z-up with outward winding", async () => {
  const mesh = await loadCadComponentMesh(cad)
  expect(bounds(mesh.positions)).toEqual([
    [12, 14],
    [23, 27],
    [34, 40],
  ])
  // Signed volume also detects accidental winding reversal at the scene boundary.
  let volume = 0
  for (let i = 0; i < mesh.indices.length; i += 3) {
    const [a, b, c] = mesh.indices
      .slice(i, i + 3)
      .map((index) => mesh.positions.slice(index * 3, index * 3 + 3))
    volume +=
      (a![0]! * (b![1]! * c![2]! - b![2]! * c![1]!) +
        a![1]! * (b![2]! * c![0]! - b![0]! * c![2]!) +
        a![2]! * (b![0]! * c![1]! - b![1]! * c![0]!)) /
      6
  }
  expect(volume).toBeCloseTo(48)
})

test("placement rotates an off-axis model about its declared origin", async () => {
  for (const [rotation, expected] of [
    [
      0,
      [
        [8, 10],
        [19, 23],
        [26, 32],
      ],
    ],
    [
      90,
      [
        [7, 11],
        [18, 20],
        [26, 32],
      ],
    ],
    [
      180,
      [
        [10, 12],
        [17, 21],
        [26, 32],
      ],
    ],
    [
      270,
      [
        [9, 13],
        [20, 22],
        [26, 32],
      ],
    ],
  ] as const) {
    const mesh = await loadCadComponentMesh({
      ...cad,
      model_origin_position: { x: 4, y: 4, z: 8 },
      rotation: { x: 0, y: 0, z: rotation },
    })
    const actual = bounds(mesh.positions)
    actual.forEach((span, axis) =>
      span.forEach((value, end) =>
        expect(value).toBeCloseTo(expected[axis]![end]!),
      ),
    )
  }
})

test("missing model cannot silently return a bounding box", async () => {
  await expect(
    loadCadComponentMesh({ ...cad, model_jscad: undefined }),
  ).rejects.toThrow("No triangle mesh")
})

test("explicit bottom-layer poses retain the same world frame at every quarter turn", async () => {
  for (const [rotation, expected] of [
    [
      0,
      [
        [10, 12],
        [19, 23],
        [28, 34],
      ],
    ],
    [
      90,
      [
        [7, 11],
        [20, 22],
        [28, 34],
      ],
    ],
    [
      180,
      [
        [8, 10],
        [17, 21],
        [28, 34],
      ],
    ],
    [
      270,
      [
        [9, 13],
        [18, 20],
        [28, 34],
      ],
    ],
  ] as const) {
    const mesh = await loadCadComponentMesh({
      ...cad,
      layer: "bottom",
      model_origin_position: { x: 4, y: 4, z: 8 },
      // Core's emitted bottom pose: proper Y half-turn plus negated Z rotation.
      rotation: { x: 0, y: 180, z: -rotation },
    })
    bounds(mesh.positions).forEach((span, axis) =>
      span.forEach((value, end) =>
        expect(value).toBeCloseTo(expected[axis]![end]!),
      ),
    )
  }
})

test("an imported OBJ follows the same origin and world placement contract", async () => {
  const obj =
    "v 2 3 4\nv 4 3 4\nv 4 7 4\nv 2 7 4\nv 2 3 10\nv 4 3 10\nv 4 7 10\nv 2 7 10\nf 1 4 3 2\nf 5 6 7 8\nf 1 2 6 5\nf 2 3 7 6\nf 3 4 8 7\nf 4 1 5 8\n"
  const mesh = await loadCadComponentMesh({
    ...cad,
    model_jscad: undefined,
    model_obj_url: `data:text/plain;base64,${Buffer.from(obj).toString("base64")}`,
    model_origin_position: { x: 4, y: 4, z: 8 },
    rotation: { x: 0, y: 0, z: 90 },
  })
  const expected = [
    [7, 11],
    [18, 20],
    [26, 32],
  ]
  bounds(mesh.positions).forEach((span, axis) =>
    span.forEach((value, end) =>
      expect(value).toBeCloseTo(expected[axis]![end]!),
    ),
  )
})
