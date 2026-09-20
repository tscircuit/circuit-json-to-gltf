import { test } from "bun:test"
import { loadGLTF } from "../../lib/loaders/gltf"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import {
  expectScenelessPoints,
  scenelessAssetUrl,
} from "../fixtures/sceneless-asset"

test("distinct sceneless roots retain separate instances of the same mesh", async () => {
  const mesh = await loadGLTF({
    url: scenelessAssetUrl({
      nodes: [
        { mesh: 0, translation: [10, 0, 0] },
        { children: [2], translation: [0, -10, 0] },
        { mesh: 0, translation: [0, 0, 20] },
      ],
    }),
    transform: COORDINATE_TRANSFORMS.IDENTITY,
  })
  expectScenelessPoints(
    mesh.triangles.flatMap((triangle) => triangle.vertices),
    [
      [11, 2, 3],
      [14, 2, 3],
      [11, 6, 8],
      [1, -8, 23],
      [4, -8, 23],
      [1, -4, 28],
    ],
  )
})
