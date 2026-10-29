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
