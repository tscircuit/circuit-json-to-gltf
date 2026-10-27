import { beforeAll, expect, test } from "bun:test"
import loadManifold, { type ManifoldToplevel } from "manifold-3d"
import { conformJscadTriangles } from "../../lib/loaders/conform-jscad-triangles"
import { loadJscadPlan } from "../../lib/loaders/jscad-plan"
import type { Triangle } from "../../lib/types"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { createJscadMeshSolid } from "../fixtures/jscad-mesh-solid"

let manifold: ManifoldToplevel
beforeAll(async () => {
  manifold = await loadManifold()
  manifold.setup()
})

test("JSCAD cutout remains empty after conforming triangulation", () => {
  const ring = createJscadMeshSolid(
    manifold,
    loadJscadPlan({
      type: "subtract",
      shapes: [
        { type: "cuboid", size: [14, 10, 6] },
        { type: "cuboid", size: [10, 6, 8] },
      ],
    }),
  )
  const probe = createJscadMeshSolid(
    manifold,
    loadJscadPlan({ type: "cuboid", size: [1, 1, 1] }),
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

test("an open triangle stays open", () => {
  const triangle: Triangle = {
    vertices: [
      { x: 1, y: 2, z: 0 },
      { x: 4, y: 2, z: 0 },
      { x: 1, y: 5, z: 0 },
    ],
    normal: { x: 0, y: 0, z: 1 },
  }
  const triangles = conformJscadTriangles([triangle], 1e-12)
  expect(triangles).toEqual([triangle])
  expect(() =>
    createJscadMeshSolid(manifold, {
      triangles,
      boundingBox: boundsOfTriangles(triangles),
    }),
  ).toThrow("Not manifold")
})
