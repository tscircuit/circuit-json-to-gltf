import { expect, test } from "bun:test"
import { clearOBJCache, loadOBJ } from "../../lib/loaders/obj"
import { clearSTLCache, loadSTL } from "../../lib/loaders/stl"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

test("loadSTL parses binary STL files whose 80-byte header starts with 'solid' and computes zero normals", async () => {
  clearSTLCache()

  // 1-triangle binary STL (84 + 50 = 134 bytes) whose header starts with "solid Exported"
  const buffer = new ArrayBuffer(134)
  const headerBytes = new TextEncoder().encode("solid Exported from SolidWorks")
  new Uint8Array(buffer, 0, headerBytes.byteLength).set(headerBytes)

  const view = new DataView(buffer)
  view.setUint32(80, 1, true) // 1 triangle

  // Normal = (0, 0, 0) -> should be computed from vertices as (0, 0, 1)
  view.setFloat32(84, 0, true)
  view.setFloat32(88, 0, true)
  view.setFloat32(92, 0, true)

  // Vertex 0: (0, 0, 0)
  view.setFloat32(96, 0, true)
  view.setFloat32(100, 0, true)
  view.setFloat32(104, 0, true)
  // Vertex 1: (2, 0, 0)
  view.setFloat32(108, 2, true)
  view.setFloat32(112, 0, true)
  view.setFloat32(116, 0, true)
  // Vertex 2: (0, 2, 0)
  view.setFloat32(120, 0, true)
  view.setFloat32(124, 2, true)
  view.setFloat32(128, 0, true)

  const base64 = Buffer.from(buffer).toString("base64")
  const dataUrl = `data:model/stl;base64,${base64}`

  const mesh = await loadSTL({
    url: dataUrl,
    transform: COORDINATE_TRANSFORMS.IDENTITY,
  })

  expect(mesh.triangles).toHaveLength(1)
  expect(mesh.triangles[0]!.normal).toEqual({ x: 0, y: 0, z: 1 })
  expect(mesh.boundingBox.max).toEqual({ x: 2, y: 2, z: 0 })
})

test("loadOBJ resolves negative (relative) vertex and normal indices and multi-word material names", async () => {
  clearOBJCache()

  const objContent = `
newmtl Gold Lead Material
Kd 1.0 0.8 0.0
endmtl
v 0 0 0
v 1 0 0
v 1 1 0
v 0 1 0
vn 0 0 1
usemtl Gold Lead Material
f -4//-1 -3//-1 -2//-1 -1//-1
`
  const dataUrl = `data:text/plain;base64,${Buffer.from(objContent).toString("base64")}`
  const mesh = await loadOBJ({
    url: dataUrl,
    transform: COORDINATE_TRANSFORMS.IDENTITY,
  })

  expect(mesh.triangles).toHaveLength(2)
  expect(mesh.triangles[0]!.normal).toEqual({ x: 0, y: 0, z: 1 })
  expect(mesh.triangles[0]!.materialIndex).toBe(0)
  expect(mesh.materials?.get("Gold Lead Material")?.color).toEqual([
    255, 204, 0, 1,
  ])
})
