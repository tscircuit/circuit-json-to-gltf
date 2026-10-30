import { expect, test } from "bun:test"
import { convertCircuitJsonToGltf, getAssemblyExplosionFrames } from "../../lib"
import { convertCircuitJsonToGltf as browserExport } from "../../lib/browser"
import { convertCircuitJsonToGltf as browserIndexExport } from "../../lib/browser-index"
import { assemblyExplosion } from "../fixtures/assembly-explosion"

test("native explosion playback preserves staged displacement and defaults to assembled in all entry points", async () => {
  const input = structuredClone(assemblyExplosion).reverse()
  const before = structuredClone(input)
  const frames = getAssemblyExplosionFrames(input)
  expect(frames.map((frame) => frame.name)).toEqual([
    "Assembled",
    "assembly.lift-bolts",
    "assembly.park-bolts",
  ])
  for (const convert of [
    convertCircuitJsonToGltf,
    browserExport,
    browserIndexExport,
  ]) {
    const render = async (explosion?: {
      throughStageRef?: string
      stageProgress?: number
    }) => {
      const gltf = (await convert(input, { format: "gltf", explosion })) as {
        nodes: { name?: string; translation?: [number, number, number] }[]
      }
      return (name: string) =>
        gltf.nodes.find((node) => node.name === name)!.translation!
    }
    const assembled = await render()
    const quarter = await render({
      throughStageRef: "assembly.lift-bolts",
      stageProgress: 0.25,
    })
    const full = await render({})
    // Compare actual exported origins, including the normal exporter axis map.
    expect(quarter("gold-bolt")).toEqual([
      assembled("gold-bolt")[0],
      assembled("gold-bolt")[1] + 5,
      assembled("gold-bolt")[2],
    ])
    expect(quarter("blue-bolt")).toEqual(assembled("blue-bolt"))
    expect(full("gold-bolt")).toEqual([
      assembled("gold-bolt")[0] - 20,
      assembled("gold-bolt")[1] + 10,
      assembled("gold-bolt")[2],
    ])
    expect(full("blue-bolt")).toEqual([
      assembled("blue-bolt")[0] - 20,
      assembled("blue-bolt")[1] + 16,
      assembled("blue-bolt")[2],
    ])
    expect(full("base")).toEqual(assembled("base"))
    expect(await render()).toBeDefined()
  }
  const face = frames[2]!.circuitJson.find(
    (record) => record.type === "cad_reference_surface",
  )!
  expect(face).toMatchObject({
    center: { x: 26, y: 7, z: 12 },
    normal: { x: 0, y: 0, z: 1 },
  })
  expect(getAssemblyExplosionFrames(frames[2]!.circuitJson)).toHaveLength(1)
  expect(input).toEqual(before)
})

test("invalid later instructions fail before partial playback", async () => {
  const malformed = structuredClone(assemblyExplosion)
  const move = malformed.find(
    (record) =>
      record.type === "cad_explosion_move" &&
      record.cad_explosion_move_id === "park-bolts",
  )!
  if (move.type !== "cad_explosion_move")
    throw new Error("Missing fixture move")
  move.targets = [
    { type: "cad_explosion_stage", cad_explosion_stage_id: "missing" },
  ]
  await expect(
    convertCircuitJsonToGltf(malformed, {
      explosion: { throughStageRef: "assembly.lift-bolts", stageProgress: 0 },
    }),
  ).rejects.toThrow("missing stage")
  expect(() => getAssemblyExplosionFrames(malformed)).toThrow("missing stage")
  await expect(
    convertCircuitJsonToGltf(assemblyExplosion, {
      explosion: { stageProgress: Number.NaN },
    }),
  ).rejects.toThrow("progress")
})

test("explosion paths are scene extras, with unchanged meshes and correct world coordinates in every entry point", async () => {
  for (const convert of [
    convertCircuitJsonToGltf,
    browserExport,
    browserIndexExport,
  ]) {
    const exportPose = async (
      explosion?: { throughStageRef?: string; stageProgress?: number },
      showExplosionLines?: boolean,
    ) =>
      (await convert(assemblyExplosion, {
        format: "gltf",
        explosion,
        showExplosionLines,
      })) as any
    const guides = (gltf: any) =>
      gltf.scenes[gltf.scene].extras?.poppygl?.explosionLines ?? []
    expect(guides(await exportPose())).toHaveLength(0)
    expect(
      guides(
        await exportPose({
          stageProgress: 0,
          throughStageRef: "assembly.lift-bolts",
        }),
      ),
    ).toHaveLength(0)
    const disabled = await exportPose({}, false)
    expect(guides(disabled)).toHaveLength(0)
    const partial = await exportPose({
      throughStageRef: "assembly.lift-bolts",
      stageProgress: 0.25,
    })
    expect(guides(partial)).toEqual([
      {
        stageRef: "assembly.lift-bolts",
        targetRef: "cad_1",
        points: [
          [-6, 2, 7],
          [-6, 7, 7],
        ],
        dashed: true,
      },
    ])
    const full = await exportPose({})
    expect(guides(full)).toHaveLength(4)
    expect(
      guides(full).find(
        (line: any) =>
          line.stageRef === "assembly.park-bolts" && line.targetRef === "cad_1",
      ).points,
    ).toEqual([
      [-6, 12, 7],
      [-26, 12, 7],
    ])
    // Overlay metadata must not add primitives, materials, nodes, or buffer data.
    for (const key of [
      "nodes",
      "meshes",
      "materials",
      "accessors",
      "bufferViews",
      "buffers",
    ])
      expect(full[key]).toEqual(disabled[key])
    const glb = (await convert(assemblyExplosion, {
      format: "glb",
      explosion: {},
    })) as ArrayBuffer
    const jsonLength = new DataView(glb).getUint32(12, true)
    const json = JSON.parse(
      new TextDecoder().decode(new Uint8Array(glb, 20, jsonLength)),
    )
    expect(guides(json)).toEqual(guides(full))
  }
})

test("a printed part authored above its CAD origin gets a guide reaching its underside", async () => {
  const input = structuredClone(assemblyExplosion)
  const part = input.find((r: any) => r.cad_component_id === "cad_1") as any
  part.model_jscad = { type: "cuboid", size: [4, 4, 2], center: [0, 0, 6] }
  const gltf = (await convertCircuitJsonToGltf(input, {
    explosion: { throughStageRef: "assembly.lift-bolts" },
  })) as any
  const guide = gltf.scenes[gltf.scene].extras.poppygl.explosionLines.find(
    (line: any) => line.targetRef === "cad_1",
  )
  // The part occupies circuit Z=7..9 assembled, Z=17..19 lifted.
  expect(guide.points).toEqual([
    [-6, 7, 7],
    [-6, 17, 7],
  ])
})
