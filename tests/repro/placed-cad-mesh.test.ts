import { expect, test } from "bun:test"
import type { CadComponent } from "circuit-json"
import loadManifold from "manifold-3d"
import * as converter from "../../lib"
import type { MeshData } from "../../lib/gltf/geometry"
import { boundsOfPositions } from "../../lib/utils/bounding-box"

// A physics/checks consumer needs assembled Circuit JSON coordinates, rather
// than a renderer's mesh plus node transform and its final glTF reflection.
// Expected failure until the public loader is implemented in the next PR.
test.failing("loadCadComponentMesh exposes indexed world-mm geometry for solid checks", async () => {
  expect(converter).toHaveProperty("loadCadComponentMesh", expect.any(Function))
  const loadCadComponentMesh = Reflect.get(
    converter,
    "loadCadComponentMesh",
  ) as (cad: CadComponent) => Promise<Pick<MeshData, "positions" | "indices">>
  const mesh = await loadCadComponentMesh({
    type: "cad_component",
    cad_component_id: "cad_world_mesh",
    source_component_id: "source_world_mesh",
    position: { x: 10, y: 20, z: 30 },
    anchor_alignment: "center",
    model_object_fit: "contain_within_bounds",
    model_origin_alignment: "unknown",
    model_jscad: { type: "cuboid", size: [2, 4, 6], center: [3, 5, 7] },
  })
  expect(boundsOfPositions(mesh.positions)).toEqual({
    min: { x: 12, y: 23, z: 34 },
    max: { x: 14, y: 27, z: 40 },
  })
  const manifold = await loadManifold()
  manifold.setup()
  const solid = new manifold.Manifold(
    new manifold.Mesh({
      numProp: 3,
      vertProperties: new Float32Array(mesh.positions),
      triVerts: new Uint32Array(mesh.indices),
    }),
  )
  try {
    expect(solid.status()).toBe("NoError")
    expect(solid.volume()).toBeCloseTo(48, 6)
  } finally {
    solid.delete()
  }
})
