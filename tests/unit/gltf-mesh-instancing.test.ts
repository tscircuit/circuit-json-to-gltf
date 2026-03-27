import { expect, test } from "bun:test"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"
import type { Scene3D, Triangle } from "../../lib/types"

test("reuses shared meshes for translated model instances", async () => {
  const sharedTriangles: Triangle[] = [
    {
      vertices: [
        { x: 0, y: 0, z: 0 },
        { x: 1, y: 0, z: 0 },
        { x: 0, y: 1, z: 0 },
      ],
      normal: { x: 0, y: 0, z: 1 },
    },
  ]

  const scene: Scene3D = {
    boxes: [
      {
        center: { x: 1, y: 2, z: 3 },
        size: { x: 1, y: 1, z: 1 },
        mesh: {
          triangles: sharedTriangles,
          boundingBox: {
            min: { x: 0, y: 0, z: 0 },
            max: { x: 1, y: 1, z: 0 },
          },
        },
      },
      {
        center: { x: 10, y: 20, z: 30 },
        size: { x: 1, y: 1, z: 1 },
        mesh: {
          triangles: sharedTriangles,
          boundingBox: {
            min: { x: 0, y: 0, z: 0 },
            max: { x: 1, y: 1, z: 0 },
          },
        },
      },
    ],
  }

  const gltf = (await convertSceneToGLTF(scene, { binary: false })) as any

  expect(gltf.meshes).toHaveLength(1)
  expect(gltf.nodes).toHaveLength(2)
  expect(gltf.nodes[0].mesh).toBe(gltf.nodes[1].mesh)
  expect(gltf.nodes[0].translation).toEqual([-1, 2, 3])
  expect(gltf.nodes[1].translation).toEqual([-10, 20, 30])
})
