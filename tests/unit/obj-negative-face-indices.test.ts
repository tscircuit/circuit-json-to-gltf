import { test, expect } from "bun:test"
import { loadOBJ } from "../../lib"

const withStubbedFetch = async (
  text: string,
  run: () => Promise<void>,
): Promise<void> => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = (async () => new Response(text)) as unknown as typeof fetch
  try {
    await run()
  } finally {
    globalThis.fetch = originalFetch
  }
}

// The OBJ format allows negative indices, which count back from the most
// recently defined element: -1 is the last vertex. Resolving them as absolute
// (-1 becomes -2) indexes before the start of the array and crashes the whole
// model load on a TypeError.
test("resolves negative face vertex indices relative to the vertex list", async () => {
  const objText = ["v 0 0 0", "v 1 0 0", "v 0 1 0", "f -3 -2 -1"].join("\n")

  await withStubbedFetch(objText, async () => {
    const mesh = await loadOBJ({
      url: "https://models.test/relative-indices.obj",
    })
    expect(mesh.triangles).toHaveLength(1)
    const [a, b, c] = mesh.triangles[0]!.vertices
    expect(a).toEqual({ x: 0, y: 0, z: 0 })
    expect(b).toEqual({ x: 1, y: 0, z: 0 })
    expect(c).toEqual({ x: 0, y: 1, z: 0 })
  })
})

test("resolves negative normal indices relative to the normal list", async () => {
  const objText = [
    "v 0 0 0",
    "v 1 0 0",
    "v 0 1 0",
    "vn 0 0 1",
    "f -3//-1 -2//-1 -1//-1",
  ].join("\n")

  await withStubbedFetch(objText, async () => {
    const mesh = await loadOBJ({
      url: "https://models.test/relative-normal-indices.obj",
    })
    expect(mesh.triangles).toHaveLength(1)
    expect(mesh.triangles[0]!.normal).toEqual({ x: 0, y: 0, z: 1 })
  })
})

test("keeps positive face indices one-based and absolute", async () => {
  const objText = ["v 0 0 0", "v 1 0 0", "v 0 1 0", "f 1 2 3"].join("\n")

  await withStubbedFetch(objText, async () => {
    const mesh = await loadOBJ({
      url: "https://models.test/absolute-indices.obj",
    })
    expect(mesh.triangles).toHaveLength(1)
    const [a, b, c] = mesh.triangles[0]!.vertices
    expect(a).toEqual({ x: 0, y: 0, z: 0 })
    expect(b).toEqual({ x: 1, y: 0, z: 0 })
    expect(c).toEqual({ x: 0, y: 1, z: 0 })
  })
})
