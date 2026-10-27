import { beforeAll, expect, test } from "bun:test"
import loadManifold, { type ManifoldToplevel } from "manifold-3d"
import { loadJscadPlan } from "../../lib/loaders/jscad-plan"
import gameboyLid from "../fixtures/gameboy-lid.json"
import { createJscadMeshSolid } from "../fixtures/jscad-mesh-solid"

let manifold: ManifoldToplevel
beforeAll(async () => {
  manifold = await loadManifold()
  manifold.setup()
})

// Reduced from the two segments at the bend of SPK_WIRE_POS in published
// ShiboSoftwareDev/linux-gameboy-advance v1.0.134. The lid is its unmodified
// GBA_CASE_LID model_jscad. Neither input is a replacement collision shape.
const sphere = (center: number[]) => ({
  type: "sphere",
  radius: 0.32,
  segments: 12,
  center,
})
const wireBend = {
  type: "union",
  shapes: [
    {
      type: "hull",
      shapes: [sphere([0, -40.1, 6.2]), sphere([35, -40.1, 6.2])],
    },
    {
      type: "hull",
      shapes: [sphere([35, -40.1, 6.2]), sphere([42, -36, 4])],
    },
  ],
}

for (const [name, model_jscad] of [
  ["wire bend", wireBend],
  ["enclosure lid", gameboyLid],
] as const) {
  test(`JSCAD ${name} currently fails closed-solid validation`, async () => {
    const mesh = loadJscadPlan(model_jscad)
    expect(() => createJscadMeshSolid(manifold, mesh)).toThrow("Not manifold")
  }, 30_000)
}
