import { test } from "bun:test"
import { loadGLTF } from "../../lib/loaders/gltf"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import {
  expectScenelessPoints,
  scenelessAssetUrl,
} from "../fixtures/sceneless-asset"

test("sceneless nodes select mesh instances rather than injecting unused resources", async () => {
  const mesh = await loadGLTF({
    url: scenelessAssetUrl({ nodes: [{ mesh: 0 }] }, 2),
    transform: COORDINATE_TRANSFORMS.IDENTITY,
  })
  expectScenelessPoints(
    mesh.triangles.flatMap((triangle) => triangle.vertices),
    [
      [1, 2, 3],
      [4, 2, 3],
      [1, 6, 8],
    ],
  )
})
