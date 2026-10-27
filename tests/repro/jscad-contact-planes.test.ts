import { beforeAll, expect, test } from "bun:test"
import loadManifold, { type ManifoldToplevel } from "manifold-3d"
import { loadCadComponentMesh } from "../../lib/loaders/cad-component-mesh"
import { loadJscadPlan } from "../../lib/loaders/jscad-plan"
import speakerContact from "../fixtures/gameboy-speaker-contact.json"
import { createJscadMeshSolid } from "../fixtures/jscad-mesh-solid"

let manifold: ManifoldToplevel
beforeAll(async () => {
  manifold = await loadManifold()
  manifold.setup()
})

async function loadSolid(model_jscad: unknown) {
  const mesh = await loadCadComponentMesh({
    type: "cad_component",
    cad_component_id: "cad_component_test",
    source_component_id: "source_component_test",
    position: { x: 0, y: 0, z: 0 },
    model_jscad,
    model_origin_position: { x: 0, y: 0, z: 0 },
    model_origin_alignment: "unknown",
    anchor_alignment: "center",
    model_object_fit: "contain_within_bounds",
  })
  return createJscadMeshSolid(manifold, mesh)
}

// Both cuboids meet at authored Circuit JSON Z=7.2 mm. Their different sizes
// select different snapping grids in the conforming loader.
const support = { type: "cuboid", size: [30, 22.2, 1.6], center: [0, 0, 6.4] }

for (const separationMm of [0, 0.00002, -0.0001]) {
  test(`independent CAD solids preserve ${separationMm} mm separation`, async () => {
    const first = await loadSolid(support)
    const second = await loadSolid({
      type: "cuboid",
      size: [20, 20, 4],
      center: [0, 0, 9.2 + separationMm],
    })
    const intersection = first.intersect(second)
    try {
      expect(first.status()).toBe("NoError")
      expect(second.status()).toBe("NoError")
      if (separationMm < 0) {
        expect(intersection.volume()).toBeGreaterThan(0.039)
      } else {
        expect(intersection.volume()).toBe(0)
      }
    } finally {
      intersection.delete()
      second.delete()
      first.delete()
    }
  })
}

test("solid triangulation retains the authored bounds of a six-sided cap", () => {
  const mesh = loadJscadPlan(
    {
      type: "cylinder",
      radius: 3,
      height: 1.6,
      center: [0, 0, 6.4],
      segments: 6,
    },
    { conformingTriangles: true },
  )
  // loadJscadPlan returns Y-up mm; authored Z is mesh Y.
  expect(mesh.boundingBox.min.y).toBeCloseTo(5.6, 12)
  expect(mesh.boundingBox.max.y).toBeCloseTo(7.2, 12)
})

test("published speaker and retainer face contact has no shared volume", async () => {
  // Unmodified model_jscad from ShiboSoftwareDev/linux-gameboy-advance v1.0.134.
  const retainer = await loadSolid(speakerContact.SPK_RETAINER)
  const speaker = await loadSolid(speakerContact.SPK_20MM)
  const intersection = retainer.intersect(speaker)
  try {
    expect(retainer.status()).toBe("NoError")
    expect(speaker.status()).toBe("NoError")
    expect(intersection.volume()).toBeCloseTo(0, 12)
  } finally {
    intersection.delete()
    speaker.delete()
    retainer.delete()
  }
})

test("the earlier NTC and adhesive union still detects battery penetration", async () => {
  const sensor = await loadSolid({
    type: "union",
    shapes: [
      { type: "sphere", radius: 1.25, center: [-2, 0, -4.72], segments: 12 },
      { type: "cuboid", size: [12, 10, 0.12], center: [-2, 0, -4.58] },
    ],
  })
  const battery = await loadSolid({
    type: "cuboid",
    size: [93.5, 60.5, 9.9],
    center: [-2, 0, -9.95],
  })
  const intersection = sensor.intersect(battery)
  try {
    expect(sensor.status()).toBe("NoError")
    expect(intersection.volume()).toBeGreaterThan(2.4)
  } finally {
    intersection.delete()
    battery.delete()
    sensor.delete()
  }
})
