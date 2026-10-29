import { expect, test } from "bun:test"
import { getAssemblyExplosionFrames } from "../../lib"
import { assemblyExplosion } from "../fixtures/assembly-explosion"
import { renderLampPanels } from "../fixtures/render-lamp-panels"

test("snapshot every native explosion stage and a sequential intermediate pose", async () => {
  const frames = getAssemblyExplosionFrames(assemblyExplosion)
  await expect(
    await renderLampPanels(
      [
        {
          label: "0. Assembled: both bolts on the fixed base",
          explosion: undefined,
        },
        {
          label: "1/4 of lift: only the gold bolt has started",
          explosion: { throughStageRef: frames[1]!.name, stageProgress: 0.25 },
        },
        {
          label: "1. Lift complete: gold +10 mm, blue +16 mm",
          explosion: frames[1]!.explosion,
        },
        {
          label: "2. Park the whole lift stage: both +20 mm in X",
          explosion: frames[2]!.explosion,
        },
      ].map((panel) => ({
        ...panel,
        circuitJson: assemblyExplosion,
        camPos: [-68, 48, 82] as [number, number, number],
        lookAt: [-8, 10, 4] as [number, number, number],
      })),
    ),
  ).toMatchPngSnapshot(import.meta.path, undefined, { maxDiffFraction: 0.002 })
})
