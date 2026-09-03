import { expect, test } from "bun:test"
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import { fetchWithTimeout } from "../../lib/loaders/fetch-with-timeout"
import { loadGLTF } from "../../lib/loaders/gltf"
import { loadOBJ } from "../../lib/loaders/obj"

async function withDirectory(run: (dir: string) => Promise<void>) {
  const dir = await mkdtemp(path.join(tmpdir(), "local-cad-"))
  try {
    await run(dir)
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

test("file URLs preserve binary bytes and URL-escaped filenames", async () => {
  await withDirectory(async (dir) => {
    const file = path.join(dir, "model #1%.bin")
    const bytes = Buffer.from([0, 127, 128, 255])
    await writeFile(file, bytes)
    const response = await fetchWithTimeout(pathToFileURL(file).href)
    expect(response.ok).toBe(true)
    expect(Buffer.from(await response.arrayBuffer())).toEqual(bytes)
  })
})

test("OBJ file references load geometry with a registry base URL configured", async () => {
  await withDirectory(async (dir) => {
    const file = path.join(dir, "part.obj")
    await writeFile(file, "v 0 0 0\nv 2 0 0\nv 0 2 0\nf 1 2 3\n")
    const mesh = await loadOBJ({
      url: pathToFileURL(file).href,
      projectBaseUrl: "https://registry.example/api/",
    })
    expect(mesh.triangles).toHaveLength(1)
  })
})

test("local GLTF loads its relative external binary buffer", async () => {
  await withDirectory(async (dir) => {
    const binary = Buffer.alloc(42)
    ;[0, 0, 0, 2, 0, 0, 0, 2, 0].forEach((value, i) =>
      binary.writeFloatLE(value, i * 4),
    )
    ;[0, 1, 2].forEach((value, i) => binary.writeUInt16LE(value, 36 + i * 2))
    const gltf = {
      asset: { version: "2.0" },
      buffers: [{ uri: "geometry.bin", byteLength: binary.length }],
      bufferViews: [
        { buffer: 0, byteOffset: 0, byteLength: 36 },
        { buffer: 0, byteOffset: 36, byteLength: 6 },
      ],
      accessors: [
        {
          bufferView: 0,
          componentType: 5126,
          count: 3,
          type: "VEC3",
          min: [0, 0, 0],
          max: [2, 2, 0],
        },
        { bufferView: 1, componentType: 5123, count: 3, type: "SCALAR" },
      ],
      meshes: [{ primitives: [{ attributes: { POSITION: 0 }, indices: 1 }] }],
      nodes: [{ mesh: 0 }],
      scenes: [{ nodes: [0] }],
      scene: 0,
    }
    const file = path.join(dir, "part.gltf")
    await writeFile(file, JSON.stringify(gltf))
    await writeFile(path.join(dir, "geometry.bin"), binary)
    const mesh = await loadGLTF({ url: pathToFileURL(file).href })
    expect(mesh.triangles).toHaveLength(1)
    expect(JSON.parse(await readFile(file, "utf8")).buffers[0].uri).toBe(
      "geometry.bin",
    )
  })
})

test("missing model files reject with the filesystem error", async () => {
  await withDirectory(async (dir) => {
    await expect(
      fetchWithTimeout(pathToFileURL(path.join(dir, "missing.obj")).href),
    ).rejects.toMatchObject({ code: "ENOENT" })
  })
})

test("file loading works under Node without fetch file support", async () => {
  await withDirectory(async (dir) => {
    const file = path.join(dir, "part.obj")
    await writeFile(file, "v 1 2 3")
    const build = await Bun.build({
      entrypoints: [path.resolve("lib/loaders/fetch-with-timeout.ts")],
      outdir: dir,
      naming: "loader.mjs",
      target: "node",
    })
    expect(build.success).toBe(true)
    const script = `
      import { fetchWithTimeout } from ${JSON.stringify(pathToFileURL(path.join(dir, "loader.mjs")).href)};
      const response = await fetchWithTimeout(${JSON.stringify(pathToFileURL(file).href)});
      console.log(await response.text());
    `
    const child = Bun.spawn(["node", "--input-type=module", "-e", script], {
      stdout: "pipe",
      stderr: "pipe",
    })
    const [code, stdout, stderr] = await Promise.all([
      child.exited,
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
    ])
    expect({ code, stderr }).toEqual({ code: 0, stderr: "" })
    expect(stdout.trim()).toBe("v 1 2 3")
  })
})
