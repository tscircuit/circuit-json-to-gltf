import { expect, test } from "bun:test"
import { loadGLB, loadOBJ, loadSTL } from "../../lib"
import { parseOBJ } from "../../lib/loaders/obj"
import { resolveModelUrl } from "../../lib/loaders/resolve-model-url"
import { parseSTL } from "../../lib/loaders/stl"

test("STL loader should parse ASCII STL and binary STL with a 'solid' header", () => {
  const asciiSTL = `solid cube
    facet normal 0 0 1
      outer loop
        vertex 0 0 0
        vertex 1 0 0
        vertex 1 1 0
      endloop
    endfacet
    facet normal 0 0 1
      outer loop
        vertex 0 0 0
        vertex 1 1 0
        vertex 0 1 0
      endloop
    endfacet
  endsolid cube`

  const asciiBuffer = new TextEncoder().encode(asciiSTL).buffer
  const asciiMesh = parseSTL(asciiBuffer)
  expect(asciiMesh.triangles).toHaveLength(2)

  // Build a valid 1-triangle binary STL whose 80-byte header starts with "solid "
  const binaryBuffer = new ArrayBuffer(84 + 50)
  const headerBytes = new TextEncoder().encode("solid exported_by_cad")
  new Uint8Array(binaryBuffer).set(headerBytes, 0)
  const view = new DataView(binaryBuffer)
  view.setUint32(80, 1, true)
  // normal (0, 0, 1)
  view.setFloat32(84, 0, true)
  view.setFloat32(88, 0, true)
  view.setFloat32(92, 1, true)
  // v0 (0, 0, 0), v1 (2, 0, 0), v2 (0, 2, 0)
  view.setFloat32(96, 0, true)
  view.setFloat32(100, 0, true)
  view.setFloat32(104, 0, true)
  view.setFloat32(108, 2, true)
  view.setFloat32(112, 0, true)
  view.setFloat32(116, 0, true)
  view.setFloat32(120, 0, true)
  view.setFloat32(124, 2, true)
  view.setFloat32(128, 0, true)

  const binaryMesh = parseSTL(binaryBuffer)
  expect(binaryMesh.triangles).toHaveLength(1)
  expect(loadSTL).toBeDefined()
  expect(typeof loadSTL).toBe("function")
})

test("OBJ loader supports negative relative vertex/normal indices, material names with spaces, and Tr transparency", async () => {
  const objText = [
    "newmtl Brushed Aluminum",
    "Kd 0.8 0.8 0.8",
    "Tr 0.25",
    "v 0 0 0",
    "v 1 0 0",
    "v 0 1 0",
    "vn 0 0 1",
    "usemtl Brushed Aluminum",
    "f -3//-1 -2//-1 -1//-1",
  ].join("\n")

  const mesh = parseOBJ(objText)
  expect(mesh.triangles).toHaveLength(1)
  expect(mesh.triangles[0]!.normal).toEqual({ x: 0, y: 0, z: 1 })
  expect(mesh.materials?.get("Brushed Aluminum")?.dissolve).toBeCloseTo(0.75, 5)
  expect(mesh.triangles[0]!.materialIndex).toBe(0)

  const dataUrl = "data:text/plain;base64,dGVzdA=="
  expect(await resolveModelUrl(dataUrl, "https://example.com/project")).toBe(
    dataUrl,
  )
  expect(loadOBJ).toBeDefined()
  expect(typeof loadOBJ).toBe("function")
})

test("GLB loader should be defined", () => {
  expect(loadGLB).toBeDefined()
  expect(typeof loadGLB).toBe("function")
})
