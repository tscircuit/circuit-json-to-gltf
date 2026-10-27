import { beforeAll, expect, test } from "bun:test"
import loadManifold, { type ManifoldToplevel } from "manifold-3d"
import { loadJscadPlan } from "../../lib/loaders/jscad-plan"
import speakerContact from "../fixtures/gameboy-speaker-contact.json"
import { createJscadMeshSolid } from "../fixtures/jscad-mesh-solid"

let manifold: ManifoldToplevel
beforeAll(async () => {
  manifold = await loadManifold()
  manifold.setup()
})

for (const separationMm of [0, 0.00002, -0.0001]) {
  test(`JSCAD contact preserves ${separationMm} mm separation`, () => {
    const support = createJscadMeshSolid(
      manifold,
      loadJscadPlan({
        type: "cuboid",
        size: [30, 22.2, 1.6],
        center: [0, 0, 6.4],
      }),
    )
    const part = createJscadMeshSolid(
      manifold,
      loadJscadPlan({
        type: "cuboid",
        size: [20, 20, 4],
        center: [0, 0, 9.2 + separationMm],
      }),
    )
    const intersection = support.intersect(part)
    try {
      expect(support.status()).toBe("NoError")
      expect(part.status()).toBe("NoError")
      if (separationMm < 0) expect(intersection.volume()).toBeGreaterThan(0.039)
      else expect(intersection.volume()).toBe(0)
    } finally {
      intersection.delete()
      part.delete()
      support.delete()
    }
  })
}

test("JSCAD cap bounds retain their authored planes", () => {
  const mesh = loadJscadPlan({
    type: "cylinder",
    radius: 3,
    height: 1.6,
    center: [0, 0, 6.4],
    segments: 6,
  })
  // The existing loader maps authored Z to mesh Y, in mm.
  expect(mesh.boundingBox.min.y).toBeCloseTo(5.6, 12)
  expect(mesh.boundingBox.max.y).toBeCloseTo(7.2, 12)
})

test("published speaker bearing planes retain authored Z = 7.2 mm", () => {
  const retainer = loadJscadPlan(speakerContact.SPK_RETAINER)
  const speaker = loadJscadPlan(speakerContact.SPK_20MM)
  expect(retainer.boundingBox.max.y).toBeCloseTo(7.2, 12)
  expect(speaker.boundingBox.min.y).toBeCloseTo(7.2, 12)
})
