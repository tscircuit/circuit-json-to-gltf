import { beforeAll, expect, spyOn, test } from "bun:test"
import type { CadComponent, PcbComponent } from "circuit-json"
import loadManifold, { type ManifoldToplevel } from "manifold-3d"
import {
  type CadComponentMesh,
  convertCircuitJsonTo3D,
  loadCadComponentMesh,
} from "../../lib"
import { boundsOfPositions } from "../../lib/utils/bounding-box"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import gameboyLid from "../fixtures/gameboy-lid.json"
import speakerContact from "../fixtures/gameboy-speaker-contact.json"
import { makeAccessorCube } from "../fixtures/glb-accessor-cubes"
import { tetrahedron, tetrahedronGltf } from "../fixtures/outward-mesh"

let manifold: ManifoldToplevel
beforeAll(async () => {
  manifold = await loadManifold()
  manifold.setup()
})

const cad: CadComponent = {
  type: "cad_component",
  cad_component_id: "cad_placed",
  source_component_id: "source_placed",
  position: { x: 10, y: 20, z: 30 },
  anchor_alignment: "center",
  model_origin_alignment: "unknown",
  model_object_fit: "contain_within_bounds",
  model_jscad: { type: "cuboid", size: [2, 4, 6], center: [3, 5, 7] },
}

function solid(mesh: CadComponentMesh) {
  return new manifold.Manifold(
    new manifold.Mesh({
      numProp: 3,
      vertProperties: new Float32Array(mesh.positions),
      triVerts: new Uint32Array(mesh.indices),
    }),
  )
}

function spans(mesh: CadComponentMesh) {
  const { min, max } = boundsOfPositions(mesh.positions)
  return [
    [min.x, max.x],
    [min.y, max.y],
    [min.z, max.z],
  ]
}

// These are authored model extents rotated about [4,4,8], then placed at
// [10,20,30]. Unequal dimensions and an off-axis origin expose mirrors.
for (const [layer, degrees, expected] of [
  [
    "top",
    0,
    [
      [8, 10],
      [19, 23],
      [26, 32],
    ],
  ],
  [
    "top",
    90,
    [
      [7, 11],
      [18, 20],
      [26, 32],
    ],
  ],
  [
    "top",
    180,
    [
      [10, 12],
      [17, 21],
      [26, 32],
    ],
  ],
  [
    "top",
    270,
    [
      [9, 13],
      [20, 22],
      [26, 32],
    ],
  ],
  [
    "bottom",
    0,
    [
      [10, 12],
      [19, 23],
      [28, 34],
    ],
  ],
  [
    "bottom",
    90,
    [
      [7, 11],
      [20, 22],
      [28, 34],
    ],
  ],
  [
    "bottom",
    180,
    [
      [8, 10],
      [17, 21],
      [28, 34],
    ],
  ],
  [
    "bottom",
    270,
    [
      [9, 13],
      [18, 20],
      [28, 34],
    ],
  ],
] as const) {
  test(`${layer} mounting at ${degrees} degrees preserves the world frame`, async () => {
    const component: CadComponent = {
      ...cad,
      layer,
      model_origin_position: { x: 4, y: 4, z: 8 },
      rotation: {
        x: 0,
        y: layer === "bottom" ? 180 : 0,
        z: layer === "bottom" ? -degrees : degrees,
      },
    }
    const before = structuredClone(component)
    const mesh = await loadCadComponentMesh(component)
    for (const [axis, span] of spans(mesh).entries()) {
      for (const [end, coordinate] of span.entries()) {
        expect(coordinate).toBeCloseTo(expected[axis]![end]!, 10)
      }
    }
    const body = solid(mesh)
    try {
      expect(body.volume()).toBeCloseTo(48, 5)
    } finally {
      body.delete()
    }
    expect(component).toEqual(before)
  })
}

test("mixed-axis rotations use the renderer's intrinsic XYZ order", async () => {
  const mesh = await loadCadComponentMesh({
    ...cad,
    model_origin_position: { x: 4, y: 4, z: 8 },
    rotation: { x: 90, y: 90, z: 0 },
  })
  expect(spans(mesh)).toEqual([
    [6, 12],
    [18, 20],
    [29, 33],
  ])
})

test("explicit JSCAD origins use the same frame in the shared renderer", async () => {
  const scene = await convertCircuitJsonTo3D(
    [
      {
        ...cad,
        model_origin_position: { x: 4, y: 4, z: 8 },
      },
    ],
    { renderBoardTextures: false },
  )
  expect(scene.boxes[0]!.mesh!.boundingBox).toEqual({
    min: { x: -2, y: -4, z: -1 },
    max: { x: 0, y: 2, z: 3 },
  })
})

test.each([false, true])(
  "a resolved assembled pose is authoritative (folded flag %s)",
  async (folded) => {
    const component = { ...cad, is_on_folded_board: folded }
    const before = structuredClone(component)
    const mesh = await loadCadComponentMesh(component)
    expect(spans(mesh)).toEqual([
      [12, 14],
      [23, 27],
      [34, 40],
    ])
    expect(component).toEqual(before)
  },
)

test("model units and CAD fit dimensions use the shared loading rules", async () => {
  const centered = { type: "cuboid", size: [2, 4, 6] }
  expect(
    spans(
      await loadCadComponentMesh({
        ...cad,
        model_jscad: centered,
        model_unit_to_mm_scale_factor: 2,
      }),
    ),
  ).toEqual([
    [8, 12],
    [16, 24],
    [24, 36],
  ])
  expect(
    spans(
      await loadCadComponentMesh({
        ...cad,
        model_jscad: centered,
        size: { x: 8, y: 4, z: 2 },
        model_object_fit: "fill_bounds",
      }),
    ),
  ).toEqual([
    [6, 14],
    [18, 22],
    [29, 31],
  ])
})

test.each([0, 0.00002, -0.0001])(
  "independent parts retain %s mm separation",
  async (gap) => {
    const support = solid(
      await loadCadComponentMesh({
        ...cad,
        position: { x: 0, y: 0, z: 0 },
        model_jscad: {
          type: "cuboid",
          size: [30, 22.2, 1.6],
          center: [0, 0, 6.4],
        },
      }),
    )
    const part = solid(
      await loadCadComponentMesh({
        ...cad,
        position: { x: 0, y: 0, z: 0 },
        model_jscad: {
          type: "cuboid",
          size: [20, 20, 4],
          center: [0, 0, 9.2 + gap],
        },
      }),
    )
    const intersection = support.intersect(part)
    try {
      if (gap < 0) expect(intersection.volume()).toBeGreaterThan(0.039)
      else expect(intersection.volume()).toBe(0)
    } finally {
      intersection.delete()
      part.delete()
      support.delete()
    }
  },
)

test("the published speaker and retainer remain closed and only touch", async () => {
  const retainerMesh = await loadCadComponentMesh({
    ...cad,
    position: { x: 0, y: 0, z: 0 },
    model_jscad: speakerContact.SPK_RETAINER,
  })
  const speakerMesh = await loadCadComponentMesh({
    ...cad,
    position: { x: 0, y: 0, z: 0 },
    model_jscad: speakerContact.SPK_20MM,
  })
  expect(boundsOfPositions(retainerMesh.positions).max.z).toBeCloseTo(7.2, 12)
  expect(boundsOfPositions(speakerMesh.positions).min.z).toBeCloseTo(7.2, 12)
  const retainer = solid(retainerMesh)
  const speaker = solid(speakerMesh)
  const intersection = retainer.intersect(speaker)
  try {
    expect(intersection.volume()).toBeCloseTo(0, 12)
  } finally {
    intersection.delete()
    speaker.delete()
    retainer.delete()
  }
})

test("the published lid stays a closed solid through the public API", async () => {
  const body = solid(
    await loadCadComponentMesh({
      ...cad,
      position: { x: 0, y: 0, z: 0 },
      model_jscad: gameboyLid,
    }),
  )
  try {
    expect(body.volume()).toBeGreaterThan(0)
  } finally {
    body.delete()
  }
}, 30_000)

const stl = `solid tetrahedron\n${tetrahedron.map((triangle) => `facet normal ${triangle.normal.x} ${triangle.normal.y} ${triangle.normal.z}\nouter loop\n${triangle.vertices.map((point) => `vertex ${point.x} ${point.y} ${point.z}`).join("\n")}\nendloop\nendfacet`).join("\n")}\nendsolid tetrahedron`
const obj =
  tetrahedron
    .flatMap((triangle) =>
      triangle.vertices.map((point) => `v ${point.x} ${point.y} ${point.z}`),
    )
    .join("\n") +
  "\n" +
  tetrahedron
    .map((_, i) => `f ${3 * i + 1} ${3 * i + 2} ${3 * i + 3}`)
    .join("\n")

test.each([
  [
    "stl",
    {
      model_stl_url: `data:model/stl;base64,${Buffer.from(stl).toString("base64")}`,
    },
  ],
  [
    "obj",
    {
      model_obj_url: `data:text/plain;base64,${Buffer.from(obj).toString("base64")}`,
    },
  ],
  [
    "gltf",
    {
      model_gltf_url: `data:model/gltf+json;base64,${Buffer.from(JSON.stringify(tetrahedronGltf())).toString("base64")}`,
    },
  ],
] as const)(
  "%s models retain their declared axes, units and outward winding",
  async (_, source) => {
    const mesh = await loadCadComponentMesh(
      { ...cad, model_jscad: undefined, ...source },
      { coordinateTransform: COORDINATE_TRANSFORMS.IDENTITY },
    )
    expect(spans(mesh)).toEqual([
      [11, 15],
      [23, 25],
      [32, 35],
    ])
    const body = solid(mesh)
    try {
      expect(body.volume()).toBeCloseTo(4, 6)
    } finally {
      body.delete()
    }
  },
)

test("GLB source origins use the declared model frame", async () => {
  const mesh = await loadCadComponentMesh(
    {
      ...cad,
      model_jscad: undefined,
      model_glb_url: `data:model/gltf-binary;base64,${Buffer.from(makeAccessorCube("packed")).toString("base64")}`,
      model_origin_position: { x: 1, y: 2, z: 3 },
    },
    { coordinateTransform: COORDINATE_TRANSFORMS.IDENTITY },
  )
  expect(spans(mesh)).toEqual([
    [9, 10],
    [17, 18],
    [28, 29],
  ])
  const body = solid(mesh)
  try {
    expect(body.volume()).toBeCloseTo(1, 6)
  } finally {
    body.delete()
  }
})

test("PCB layer fallback uses the same bottom rotation as the renderer", async () => {
  const pcbComponent: PcbComponent = {
    type: "pcb_component",
    pcb_component_id: "pcb_placed",
    source_component_id: cad.source_component_id,
    center: { x: 10, y: 20 },
    width: 2,
    height: 4,
    rotation: 0,
    layer: "bottom",
    obstructs_within_bounds: true,
  }
  const mesh = await loadCadComponentMesh(
    { ...cad, pcb_component_id: pcbComponent.pcb_component_id },
    { pcbComponent },
  )
  expect(spans(mesh)).toEqual([
    [12, 14],
    [13, 17],
    [20, 26],
  ])
})

test("missing and empty models cannot silently return a bounding box", async () => {
  const cube = { type: "cuboid", size: [2, 2, 2] }
  for (const model_jscad of [
    undefined,
    { type: "subtract", shapes: [cube, cube] },
  ]) {
    await expect(loadCadComponentMesh({ ...cad, model_jscad })).rejects.toThrow(
      "No triangle mesh available for cad_placed",
    )
  }
})

test("open model surfaces stay open", async () => {
  const mesh = await loadCadComponentMesh({
    ...cad,
    model_jscad: undefined,
    model_obj_url:
      "data:text/plain,v%200%200%200%0Av%201%200%200%0Av%200%201%200%0Af%201%202%203",
  })
  expect(mesh.indices).toHaveLength(3)
  expect(() => solid(mesh)).toThrow("Not manifold")
})

test("project model downloads preserve their resolved URL and auth headers", async () => {
  let requestedUrl = ""
  let authorization = ""
  const server = Bun.serve({
    port: 0,
    fetch(request) {
      requestedUrl = request.url
      authorization = request.headers.get("Authorization") ?? ""
      return new Response(stl)
    },
  })
  try {
    const mesh = await loadCadComponentMesh(
      {
        ...cad,
        model_jscad: undefined,
        model_stl_url: "./node_modules/@tsci/example.parts/assets/tetra.stl",
      },
      {
        projectBaseUrl: server.url.origin,
        authHeaders: { Authorization: "Bearer test-cad-model" },
        coordinateTransform: COORDINATE_TRANSFORMS.IDENTITY,
      },
    )
    expect(spans(mesh)).toEqual([
      [11, 15],
      [23, 25],
      [32, 35],
    ])
    const url = new URL(requestedUrl)
    expect(url.pathname).toBe("/package_files/download")
    expect(url.searchParams.get("package_name_with_version")).toBe(
      "@example/parts@latest",
    )
    expect(url.searchParams.get("file_path")).toBe("dist/assets/tetra.stl")
    expect(authorization).toBe("Bearer test-cad-model")
  } finally {
    await server.stop()
  }
})

test("failed model decoding cannot return fallback geometry", async () => {
  const error = spyOn(console, "error").mockImplementation(() => {})
  try {
    await expect(
      loadCadComponentMesh({
        ...cad,
        model_jscad: undefined,
        model_glb_url: "data:model/gltf-binary;base64,bm90LWEtZ2xi",
      }),
    ).rejects.toThrow("No triangle mesh available for cad_placed")
  } finally {
    error.mockRestore()
  }
})

test("CAD cutouts stay empty in the world mesh", async () => {
  const ring = solid(
    await loadCadComponentMesh({
      ...cad,
      model_jscad: {
        type: "subtract",
        shapes: [
          { type: "cuboid", size: [14, 10, 6] },
          { type: "cuboid", size: [10, 6, 8] },
        ],
      },
    }),
  )
  const probe = solid(
    await loadCadComponentMesh({
      ...cad,
      model_jscad: { type: "cuboid", size: [1, 1, 1] },
    }),
  )
  const intersection = ring.intersect(probe)
  try {
    expect(ring.volume()).toBeCloseTo(480, 6)
    expect(intersection.volume()).toBe(0)
  } finally {
    intersection.delete()
    probe.delete()
    ring.delete()
  }
})
