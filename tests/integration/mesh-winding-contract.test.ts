import { afterAll, beforeAll, expect, test } from "bun:test"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { loadSTL } from "../../lib/loaders/stl"
import { loadOBJ } from "../../lib/loaders/obj"
import { loadGLB } from "../../lib/loaders/glb"
import { loadGLTF, fetchGltfAndConvertToGlb } from "../../lib/loaders/gltf"
import { loadSTEP } from "../../lib/loaders/step"
import { loadJscadPlan } from "../../lib/loaders/jscad-plan"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import type { CoordinateTransformConfig, STLMesh } from "../../lib/types"
import {
  assertOutward,
  readExportedTriangles,
  tetrahedron,
  tetrahedronGltf,
} from "../fixtures/outward-mesh"

const ascii = `solid tetrahedron\n${tetrahedron.map((t) => `facet normal ${t.normal.x} ${t.normal.y} ${t.normal.z}\nouter loop\n${t.vertices.map((v) => `vertex ${v.x} ${v.y} ${v.z}`).join("\n")}\nendloop\nendfacet`).join("\n")}\nendsolid tetrahedron`
const binaryStl = new ArrayBuffer(84 + 50 * tetrahedron.length)
const stlView = new DataView(binaryStl)
stlView.setUint32(80, tetrahedron.length, true)
for (const [i, t] of tetrahedron.entries()) {
  const values = [t.normal, ...t.vertices].flatMap((v) => [v.x, v.y, v.z])
  for (const [j, value] of values.entries())
    stlView.setFloat32(84 + i * 50 + j * 4, value, true)
}
const obj =
  tetrahedron
    .flatMap((t) => t.vertices.map((v) => `v ${v.x} ${v.y} ${v.z}`))
    .join("\n") +
  "\n" +
  tetrahedron
    .map((_, i) => `f ${i * 3 + 1} ${i * 3 + 2} ${i * 3 + 3}`)
    .join("\n")
let sourceGlb: ArrayBuffer
const sourceUrl = "https://winding-fixtures.test/"
const originalFetch = globalThis.fetch
// Keep loader tests offline; only fetch transport is replaced, all parsers run.
globalThis.fetch = (async (input: string | URL | Request) => {
  const request = input instanceof Request ? input : new Request(input)
  if (!request.url.startsWith(sourceUrl)) return originalFetch(input)

  switch (new URL(request.url).pathname) {
    case "/ascii.stl":
      return new Response(ascii)
    case "/binary.stl":
      return new Response(binaryStl)
    case "/plain.obj":
      return new Response(obj)
    case "/material.obj":
      return new Response(
        "newmtl painted\nKd 0.2 0.3 0.4\nendmtl\nusemtl painted\n" + obj,
      )
    case "/source.gltf":
      return Response.json(tetrahedronGltf())
    case "/source.glb":
      return new Response(sourceGlb)
    case "/source.step":
      return new Response(
        Bun.file(new URL("../assets/TO-92_Inline.step", import.meta.url)),
      )
    default:
      return new Response("missing", { status: 404 })
  }
}) as typeof fetch
beforeAll(async () => {
  sourceGlb = await fetchGltfAndConvertToGlb(`${sourceUrl}source.gltf`)
})
afterAll(() => {
  globalThis.fetch = originalFetch
})

async function assertExport(mesh: STLMesh, volume: number) {
  const glb = (await convertSceneToGLTF(
    {
      boxes: [
        {
          center: { x: 0, y: 0, z: 0 },
          size: { x: 4, y: 3, z: 2 },
          mesh,
          color: "#879568",
        },
      ],
    },
    { binary: true },
  )) as ArrayBuffer
  assertOutward(readExportedTriangles(glb), volume)
}
const transforms: [string, CoordinateTransformConfig | undefined, number][] = [
  ["default", undefined, 4],
  ["identity", COORDINATE_TRANSFORMS.IDENTITY, 4],
  ["axis swap", COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP, 4],
  ["proper rotation", COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP, 4],
  ["footprinter", COORDINATE_TRANSFORMS.FOOTPRINTER_MODEL_TRANSFORM, 4],
  [
    "scaled reflection",
    { flipX: -2, flipY: 3, flipZ: 0.5, rotation: { x: 37, y: 23, z: 11 } },
    12,
  ],
]
for (const [name, path, loader] of [
  ["ASCII STL", "ascii.stl", loadSTL],
  ["binary STL", "binary.stl", loadSTL],
  ["OBJ", "plain.obj", loadOBJ],
  ["material OBJ", "material.obj", loadOBJ],
  ["GLB", "source.glb", loadGLB],
  ["glTF", "source.gltf", loadGLTF],
] as const)
  for (const [transformName, transform, volume] of transforms) {
    test(`${name} preserves outward faces in Scene3D and GLB: ${transformName}`, async () => {
      const mesh = await loader({ url: `${sourceUrl}${path}`, transform })
      assertOutward(mesh.triangles, volume)
      await assertExport(mesh, volume)
    })
  }
for (const [name, transform] of transforms.slice(0, 4))
  test(`actual STEP loader preserves outward faces: ${name}`, async () => {
    const mesh = await loadSTEP({ url: `${sourceUrl}source.step`, transform })
    const volume = assertOutward(mesh.triangles)
    expect(volume).toBeGreaterThan(0)
    await assertExport(mesh, volume)
  })
test("JSCAD generated solids preserve outward faces through export", async () => {
  const mesh = loadJscadPlan({ type: "cuboid", size: [4, 3, 2] })
  assertOutward(mesh.triangles, 24)
  await assertExport(mesh, 24)
})
for (const texture of [false, true])
  for (const folded of [false, true])
    test(`board textured=${texture} folded=${folded} shares outward export convention`, async () => {
      const scene = await convertCircuitJsonTo3D(
        [
          {
            type: "pcb_board",
            pcb_board_id: "board",
            center: { x: 0, y: 0 },
            width: 40,
            height: 20,
            thickness: 0.12,
            num_layers: 2,
            material: "flex",
          },
          {
            type: "pcb_bend",
            pcb_bend_id: "bend",
            pcb_board_id: "board",
            start: { x: 0, y: -10 },
            end: { x: 0, y: 10 },
            bend_angle: 90,
            bend_radius: 2,
            bend_side: "right",
          },
        ],
        {
          foldPcbs: folded,
          renderBoardTextures: texture,
          textureResolution: 32,
        },
      )
      assertOutward(scene.boxes[0]!.mesh!.triangles)
      const glb = (await convertSceneToGLTF(scene, {
        binary: true,
      })) as ArrayBuffer
      assertOutward(readExportedTriangles(glb), folded ? undefined : 96)
    })
test("all mesh serializers preserve authored UVs", async () => {
  const triangles = tetrahedron.map((t, i) => ({
    ...t,
    uvs: [
      { u: i, v: 0 },
      { u: i, v: 1 },
      { u: i, v: 2 },
    ] as [
      { u: number; v: number },
      { u: number; v: number },
      { u: number; v: number },
    ],
  }))
  // The generic serializer is also the textured-board/material serializer.
  const { createMeshFromSTL, createMeshFromOBJ } = await import(
    "../../lib/gltf/geometry"
  )
  const mesh = { triangles, boundingBox: boundsOfTriangles(tetrahedron) }
  const plain = createMeshFromSTL(mesh)
  const painted = createMeshFromOBJ({
    ...mesh,
    materials: new Map([["painted", { name: "painted" }]]),
  })[0]!.meshData
  expect(plain.texcoords).toEqual(
    tetrahedron.flatMap((_, i) => [i, 0, i, 1, i, 2]),
  )
  expect(painted).toEqual(plain)
})
