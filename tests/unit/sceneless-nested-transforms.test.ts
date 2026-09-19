import { test } from "bun:test"
import { loadGLTF } from "../../lib/loaders/gltf"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import {
  expectScenelessPoints,
  scenelessAssetUrl,
} from "../fixtures/sceneless-asset"

test("sceneless roots compose parent TRS with a child matrix without recentering", async () => {
  const mesh = await loadGLTF({
    url: scenelessAssetUrl({
      nodes: [
        {
          translation: [10, -4, 7],
          rotation: [0, 0, Math.SQRT1_2, Math.SQRT1_2],
          scale: [2, 3, 1],
          children: [1],
        },
        {
          mesh: 0,
          matrix: [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 5, 1, -2, 1],
        },
      ],
    }),
    transform: COORDINATE_TRANSFORMS.IDENTITY,
  })
  expectScenelessPoints(
    mesh.triangles.flatMap((triangle) => triangle.vertices),
    [
      [1, 8, 8],
      [1, 14, 8],
      [-11, 8, 13],
    ],
  )
})
