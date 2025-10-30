import { expect, test } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import type { CircuitJson } from "circuit-json"

const TYPE_COMPONENTS: Record<string, number> = {
  SCALAR: 1,
  VEC2: 2,
  VEC3: 3,
  VEC4: 4,
  MAT4: 16,
}

function readFloatAccessor(
  gltf: any,
  accessorIndex: number,
  buffer: Buffer,
): number[] {
  const accessor = gltf.accessors[accessorIndex]!
  const bufferView = gltf.bufferViews[accessor.bufferView]!
  const componentType = accessor.componentType

  if (componentType !== 5126) {
    throw new Error(`Expected FLOAT accessor, got ${componentType}`)
  }

  const componentCount = TYPE_COMPONENTS[accessor.type as string] ?? 1
  const byteOffset = (bufferView.byteOffset ?? 0) + (accessor.byteOffset ?? 0)
  const byteLength = accessor.count * componentCount * 4
  const slice = buffer.slice(byteOffset, byteOffset + byteLength)
  const view = new Float32Array(
    slice.buffer,
    slice.byteOffset,
    accessor.count * componentCount,
  )
  return Array.from(view)
}

test("top board texture UVs preserve orientation", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 0, y: 0 },
      width: 12,
      height: 12,
      thickness: 1.6,
    },
  ] as any

  const gltf = (await convertCircuitJsonToGltf(circuitJson, {
    format: "gltf",
    boardTextureResolution: 64,
  })) as any

  expect(gltf.meshes?.length ?? 0).toBeGreaterThan(0)

  const topMaterialIndex = gltf.materials?.findIndex(
    (material: any) =>
      typeof material.name === "string" &&
      material.name.startsWith("TopMaterial"),
  )

  expect(topMaterialIndex).toBeGreaterThanOrEqual(0)

  const boardMesh = gltf.meshes.find((mesh: any) =>
    mesh.primitives?.some(
      (primitive: any) => primitive.material === topMaterialIndex,
    ),
  )

  expect(boardMesh).toBeDefined()

  const topPrimitive = boardMesh.primitives.find(
    (primitive: any) => primitive.material === topMaterialIndex,
  )

  expect(topPrimitive).toBeDefined()

  const bufferUri: string = gltf.buffers[0]!.uri
  const base64Data = bufferUri.split(",")[1]
  expect(base64Data).toBeDefined()
  const buffer = Buffer.from(base64Data!, "base64")

  const positions = readFloatAccessor(
    gltf,
    topPrimitive.attributes.POSITION,
    buffer,
  )
  const texcoords = readFloatAccessor(
    gltf,
    topPrimitive.attributes.TEXCOORD_0,
    buffer,
  )

  let minX = Infinity
  let maxX = -Infinity
  let minZ = Infinity
  let maxZ = -Infinity

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]!
    const z = positions[i + 2]!
    minX = Math.min(minX, x)
    maxX = Math.max(maxX, x)
    minZ = Math.min(minZ, z)
    maxZ = Math.max(maxZ, z)
  }

  const sizeX = maxX - minX
  const sizeZ = maxZ - minZ

  for (let vertexIndex = 0; vertexIndex < positions.length / 3; vertexIndex++) {
    const x = positions[vertexIndex * 3]!
    const z = positions[vertexIndex * 3 + 2]!
    const u = texcoords[vertexIndex * 2]!
    const v = texcoords[vertexIndex * 2 + 1]!

    const normalizedX = sizeX > 0 ? (x - minX) / sizeX : 0.5
    const normalizedZ = sizeZ > 0 ? (z - minZ) / sizeZ : 0.5

    expect(u).toBeCloseTo(1 - normalizedX, 6)
    expect(v).toBeCloseTo(1 - normalizedZ, 6)
  }
})
