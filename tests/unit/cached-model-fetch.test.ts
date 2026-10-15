import { expect, test } from "bun:test"
import { convertCircuitJsonToGltf, loadOBJ, loadSTL } from "../../lib/index"
import { loadGLTF } from "../../lib/loaders/gltf"

const base = "https://assets.example.test/"
const obj = "v 0 0 0\nv 1 0 0\nv 0 1 0\nf 1 2 3\n"
const stl = `solid cached
facet normal 0 0 1
outer loop
vertex 0 0 0
vertex 1 0 0
vertex 0 1 0
endloop
endfacet
endsolid cached`

const fakeAssetFetch = (files: Map<string, string | Uint8Array>) => {
  const requests: Array<{ url: string; init?: RequestInit }> = []
  const fetch: typeof globalThis.fetch = Object.assign(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input)
      requests.push({ url, init })
      const body = files.get(url)
      if (body === undefined) throw new Error(`Cached model missing: ${url}`)
      return new Response(
        typeof body === "string" ? body : new Uint8Array(body).buffer,
      )
    },
    { preconnect: () => {} },
  )
  return { fetch, requests }
}

const withoutNetwork = async (run: () => Promise<void>) => {
  const previousFetch = globalThis.fetch
  const requests: unknown[] = []
  globalThis.fetch = Object.assign(
    async (...request: Parameters<typeof fetch>) => {
      requests.push(request)
      throw new Error("External requests are disabled")
    },
    { preconnect: () => {} },
  )
  try {
    await run()
    expect(requests).toEqual([])
  } finally {
    globalThis.fetch = previousFetch
  }
}

test("OBJ/STL use cached responses and forward auth and cancellation to that transport", async () => {
  await withoutNetwork(async () => {
    const cache = fakeAssetFetch(
      new Map([
        [`${base}part.obj`, obj],
        [`${base}part.stl`, stl],
      ]),
    )
    const mesh = await loadOBJ({
      url: `${base}part.obj`,
      fetch: cache.fetch,
      authHeaders: { Authorization: "Bearer fake-token" },
    })
    expect(mesh.triangles).toHaveLength(1)
    expect(
      (await loadSTL({ url: `${base}part.stl`, fetch: cache.fetch })).triangles,
    ).toHaveLength(1)
    expect(cache.requests[0]?.init?.headers).toEqual({
      Authorization: "Bearer fake-token",
    })
    expect(cache.requests[0]?.init?.signal).toBeInstanceOf(AbortSignal)
    await expect(
      loadOBJ({ url: `${base}missing.obj`, fetch: cache.fetch }),
    ).rejects.toThrow("Cached model missing")
  })
})

test("custom transports cannot reuse models from another cache provider", async () => {
  await withoutNetwork(async () => {
    const url = `${base}shared.obj`
    const first = fakeAssetFetch(new Map([[url, obj]]))
    const second = fakeAssetFetch(new Map([[url, `${obj}f 1 3 2\n`]]))
    expect((await loadOBJ({ url, fetch: first.fetch })).triangles).toHaveLength(
      1,
    )
    expect(
      (await loadOBJ({ url, fetch: second.fetch })).triangles,
    ).toHaveLength(2)
    expect(second.requests).toHaveLength(1)
  })
})

test("glTF's external binary buffers use the same cached transport", async () => {
  await withoutNetwork(async () => {
    const binary = new Uint8Array(42)
    binary.set(
      new Uint8Array(new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]).buffer),
    )
    binary.set(new Uint8Array(new Uint16Array([0, 1, 2]).buffer), 36)
    const document = {
      asset: { version: "2.0" },
      buffers: [{ uri: "part.bin", byteLength: 42 }],
      bufferViews: [
        { buffer: 0, byteOffset: 0, byteLength: 36 },
        { buffer: 0, byteOffset: 36, byteLength: 6 },
      ],
      accessors: [
        { bufferView: 0, componentType: 5126, count: 3, type: "VEC3" },
        { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
      ],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
      nodes: [{ mesh: 0 }],
      scenes: [{ nodes: [0] }],
    }
    const cache = fakeAssetFetch(
      new Map<string, string | Uint8Array>([
        [`${base}part.gltf`, JSON.stringify(document)],
        [`${base}part.bin`, binary],
      ]),
    )
    const mesh = await loadGLTF({ url: `${base}part.gltf`, fetch: cache.fetch })
    expect(mesh.triangles).toHaveLength(1)
    expect(cache.requests.map(({ url }) => url)).toEqual([
      `${base}part.gltf`,
      `${base}part.bin`,
    ])
  })
})

test("the public GLB conversion forwards the transport to component model loading", async () => {
  await withoutNetwork(async () => {
    const cache = fakeAssetFetch(new Map([[`${base}part.obj`, obj]]))
    const result = await convertCircuitJsonToGltf(
      [
        {
          type: "cad_component",
          cad_component_id: "cad1",
          pcb_component_id: "pcb1",
          model_obj_url: `${base}part.obj`,
          position: { x: 0, y: 0, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          size: { x: 1, y: 1, z: 1 },
        },
      ] as any,
      { format: "glb", fetch: cache.fetch },
    )
    expect(result).toBeInstanceOf(ArrayBuffer)
    expect(new DataView(result as ArrayBuffer).getUint32(0, true)).toBe(
      0x46546c67,
    )
    expect(cache.requests.map(({ url }) => url)).toEqual([`${base}part.obj`])
  })
})
