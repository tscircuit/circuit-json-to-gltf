// Run with: bun scripts/reproduce-via-soldermask-consumer.ts
// Reproduce actual installed-package behavior, not a mocked renderer.
import { cp, mkdir, mkdtemp, writeFile } from "node:fs/promises"
import { resolve, join } from "node:path"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { Resvg } from "@resvg/resvg-js"
import { getBestCameraPosition } from "../lib/utils/camera-position"
import fixture from "../tests/fixtures/via-tenting.json"
import type { CircuitJson } from "circuit-json"

const root = resolve(import.meta.dir, "..")
await mkdir(join(root, "work"), { recursive: true })
const work = await mkdtemp(join(root, "work/via-soldermask-"))
const output = join(root, "tests/repro/visuals")
await mkdir(output, { recursive: true })
async function run(cmd: string[], cwd: string) {
  const proc = Bun.spawn(cmd, { cwd, stdout: "pipe", stderr: "pipe" })
  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ])
  if (exitCode !== 0) throw new Error(`${cmd.join(" ")}\n${stdout}\n${stderr}`)
  return stdout
}
await run([process.execPath, "run", "build"], root)
// Before the PR, the corrected SVG renderer was only a dev/peer dependency.
const before = JSON.parse(
  await run(["git", "show", "89013a1:package.json"], root),
)
const after = await Bun.file(join(root, "package.json")).json()
const camera = getBestCameraPosition(fixture as CircuitJson, {
  direction: [0, 1, -1e-3],
  ortho: true,
  aspectRatio: 4 / 3,
})
const cases = [
  {
    name: "main-compatible-renderer",
    manifest: before,
    svg: "0.0.445",
    white: true,
  },
  {
    name: "main-older-app-renderer",
    manifest: before,
    svg: "0.0.424",
    white: false,
  },
  {
    name: "pr-older-app-renderer",
    manifest: after,
    svg: "0.0.424",
    white: true,
  },
]
for (const sample of cases) {
  const staging = join(work, `${sample.name}-package`)
  const consumer = join(work, sample.name)
  await mkdir(staging)
  await mkdir(consumer)
  await cp(join(root, "dist"), join(staging, "dist"), { recursive: true })
  await writeFile(
    join(staging, "package.json"),
    JSON.stringify(sample.manifest),
  )
  await run([process.execPath, "pm", "pack", "--destination", staging], staging)
  const tarball = join(
    staging,
    `circuit-json-to-gltf-${sample.manifest.version}.tgz`,
  )
  await writeFile(
    join(consumer, "package.json"),
    JSON.stringify({
      private: true,
      type: "module",
      dependencies: {
        "circuit-json-to-gltf": `file:${tarball}`,
        "circuit-to-svg": sample.svg,
      },
    }),
  )
  await run([process.execPath, "install"], consumer)
  const glbPath = join(consumer, "board.glb")
  await writeFile(
    join(consumer, "export.ts"),
    `
import { convertCircuitJsonToGltf } from "circuit-json-to-gltf"
const circuit = await Bun.file(${JSON.stringify(join(root, "tests/fixtures/via-tenting.json"))}).json()
const glb = await convertCircuitJsonToGltf(circuit, {
  format: "glb", includeModels: false, boardTextureResolution: 1200, showPcbNotes: true,
})
await Bun.write(${JSON.stringify(glbPath)}, glb as ArrayBuffer)
`,
  )
  await run([process.execPath, "export.ts"], consumer)
  const glb = await Bun.file(glbPath).arrayBuffer()
  await writeFile(
    join(output, `${sample.name}.png`),
    await renderGLTFToPNGFromGLB(glb, {
      ...camera,
      width: 1200,
      height: 900,
      backgroundColor: [1, 1, 1],
    }),
  )
  // Probe an actual embedded texture at Circuit JSON (-8, 2), where the
  // fixture's silkscreen crosses a tented via. PNG rows run downward from +Y.
  const view = new DataView(glb)
  const jsonLength = view.getUint32(12, true)
  const gltf = JSON.parse(
    new TextDecoder().decode(new Uint8Array(glb, 20, jsonLength)),
  )
  const imageView = gltf.bufferViews[gltf.images[0].bufferView]
  const png = new Uint8Array(
    glb,
    28 + jsonLength + (imageView.byteOffset ?? 0),
    imageView.byteLength,
  )
  const pixels = new Resvg(
    `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900"><image href="data:image/png;base64,${Buffer.from(png).toString("base64")}" width="1200" height="900"/></svg>`,
  ).render().pixels
  const offset = (350 * 1200 + 200) * 4
  const pixel = Array.from(pixels.subarray(offset, offset + 4))
  const isWhite = pixel.every((channel) => channel === 255)
  if (isWhite !== sample.white)
    throw new Error(`${sample.name}: unexpected overlap pixel ${pixel}`)
  console.log(`${sample.name}: overlap pixel ${JSON.stringify(pixel)}`)
}
console.log(`GLB renders saved to ${output}`)
