import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"
import type { GLTF } from "../../lib/gltf/gltf-types"
import type { Scene3D, Triangle } from "../../lib/types"

const png = new Resvg(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"><rect width="1" height="1" fill="white"/></svg>',
)
  .render()
  .asPng()
const texture = `data:image/png;base64,${Buffer.from(png).toString("base64")}`

for (const binary of [false, true]) {
  for (const textured of [false, true]) {
    for (const triangleCount of [21845, 21846]) {
      test(`${binary ? "GLB" : "glTF"} preserves ${triangleCount * 3} ${textured ? "textured" : "untextured"} vertices`, async () => {
        const triangles: Triangle[] = Array.from(
          { length: triangleCount },
          (_, i) => ({
            vertices: [
              { x: i * 2, y: 0, z: 0 },
              { x: i * 2, y: 0, z: 1 },
              { x: i * 2 + 1, y: 0, z: 0 },
            ],
            normal: { x: 0, y: 1, z: 0 },
          }),
        )
        const scene: Scene3D = {
          boxes: [
            {
              center: { x: 0, y: 0, z: 0 },
              size: { x: triangleCount * 2, y: 0, z: 1 },
              texture: textured ? { top: texture } : undefined,
              mesh: {
                triangles,
                boundingBox: {
                  min: { x: 0, y: 0, z: 0 },
                  max: { x: triangleCount * 2 - 1, y: 0, z: 1 },
                },
              },
            },
          ],
        }
        const result = await convertSceneToGLTF(scene, { binary })
        let gltf: GLTF
        let buffer: ArrayBuffer
        if (result instanceof ArrayBuffer) {
          const jsonLength = new DataView(result).getUint32(12, true)
          gltf = JSON.parse(
            new TextDecoder().decode(new Uint8Array(result, 20, jsonLength)),
          )
          buffer = result.slice(28 + jsonLength)
        } else {
          gltf = result as GLTF
          const data = gltf.buffers![0]!.uri!.split(",")[1]!
          buffer = Uint8Array.from(atob(data), (c) => c.charCodeAt(0)).buffer
        }
        const primitive = gltf.meshes![0]!.primitives[0]!
        const accessor = gltf.accessors![primitive.indices!]!
        const view = gltf.bufferViews![accessor.bufferView!]!
        const indices =
          accessor.componentType === 5125
            ? new Uint32Array(buffer, view.byteOffset, accessor.count)
            : new Uint16Array(buffer, view.byteOffset, accessor.count)
        const vertexCount = triangleCount * 3
        expect(new Set(indices).size).toBe(vertexCount)
        expect(Array.from(indices.slice(-3)).sort((a, b) => a - b)).toEqual([
          vertexCount - 3,
          vertexCount - 2,
          vertexCount - 1,
        ])
        expect(accessor.componentType).toBe(
          triangleCount === 21845 ? 5123 : 5125,
        )
      })
    }
  }
}
