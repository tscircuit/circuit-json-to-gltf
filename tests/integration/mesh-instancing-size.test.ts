import { expect, test } from "bun:test"
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { loadSTEP } from "../../lib/loaders/step"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"
import type { Scene3D } from "../../lib/types"

const createSceneWithCopies = (
  mesh: Awaited<ReturnType<typeof loadSTEP>>,
  copies: number,
): Scene3D => ({
  boxes: Array.from({ length: copies }, (_, i) => ({
    center: { x: i * 2, y: 0, z: 0 },
    size: { x: 1, y: 1, z: 1 },
    mesh,
    label: `inst-${i}`,
  })),
})

test("100 copies of a large STEP model do not blow up GLB size", async () => {
  const stepPath = join(process.cwd(), "tests/assets/ExampleModelPin.step")
  const stepFile = readFileSync(stepPath)
  const stepDataUrl = `data:model/step;base64,${stepFile.toString("base64")}`

  const mesh = await loadSTEP({ url: stepDataUrl })

  const oneCopyGltf = (await convertSceneToGLTF(
    createSceneWithCopies(mesh, 1),
    {
      binary: false,
    },
  )) as any
  const hundredCopyGltf = (await convertSceneToGLTF(
    createSceneWithCopies(mesh, 100),
    {
      binary: false,
    },
  )) as any

  expect(oneCopyGltf.meshes).toHaveLength(1)
  expect(hundredCopyGltf.meshes).toHaveLength(1)
  expect(hundredCopyGltf.nodes).toHaveLength(100)

  const oneCopyGlb = (await convertSceneToGLTF(createSceneWithCopies(mesh, 1), {
    binary: true,
  })) as ArrayBuffer
  const hundredCopyGlb = (await convertSceneToGLTF(
    createSceneWithCopies(mesh, 100),
    {
      binary: true,
    },
  )) as ArrayBuffer

  const sizeRatio = hundredCopyGlb.byteLength / oneCopyGlb.byteLength

  expect(sizeRatio).toBeLessThan(2)
})
