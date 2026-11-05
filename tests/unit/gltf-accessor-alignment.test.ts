import { expect, test } from "bun:test"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"
import type { GLTF } from "../../lib/gltf/gltf-types"
import { parseGLB } from "../../lib/loaders/glb"
import type { Scene3D, STLMesh } from "../../lib/types"

// Distinct triangle meshes avoid instancing; each has a six-byte index buffer.
const scene: Scene3D = {
  boxes: [1, 2, 3].map((size) => {
    const mesh: STLMesh = {
      triangles: [
        {
          vertices: [
            { x: 0, y: 0, z: 0 },
            { x: size, y: 0, z: 0 },
            { x: 0, y: size, z: 0 },
          ],
          normal: { x: 0, y: 0, z: 1 },
        },
      ],
      boundingBox: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: size, y: size, z: 0 },
      },
    }
    return { center: { x: 0, y: 0, z: 0 }, size: mesh.boundingBox.max, mesh }
  }),
}

test("glTF vertex data remains readable after odd triangle index counts", async () => {
  const gltf = (await convertSceneToGLTF(scene)) as GLTF
  const base64 = gltf.buffers![0]!.uri!.split(",")[1]!
  const buffer = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0)).buffer

  expect(gltf.meshes).toHaveLength(3)
  for (const [index, mesh] of gltf.meshes!.entries()) {
    const primitive = mesh.primitives[0]!
    const position = gltf.accessors![primitive.attributes.POSITION]!
    const view = gltf.bufferViews![position.bufferView!]!
    const positions = new Float32Array(buffer, view.byteOffset, 9)
    expect(Array.from(positions)).toEqual([
      -0,
      0,
      0,
      -(index + 1),
      0,
      0,
      -0,
      index + 1,
      0,
    ])
    for (const accessorIndex of Object.values(primitive.attributes)) {
      const accessor = gltf.accessors![accessorIndex]!
      const attributeView = gltf.bufferViews![accessor.bufferView!]!
      expect(attributeView.byteOffset! % 4).toBe(0)
    }
  }
})

test("GLB with consecutive odd triangle meshes can be loaded again", async () => {
  const glb = (await convertSceneToGLTF(scene, { binary: true })) as ArrayBuffer
  const mesh = parseGLB(glb)
  expect(mesh.triangles).toHaveLength(3)
  // parseGLB's default axis mapping converts glTF Y to Circuit JSON Z.
  expect(mesh.boundingBox.min).toEqual({ x: -3, y: 0, z: 0 })
  expect(mesh.boundingBox.max).toEqual({ x: 0, y: 0, z: 3 })
})
