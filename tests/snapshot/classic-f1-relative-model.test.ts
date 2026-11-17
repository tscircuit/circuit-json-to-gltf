import { expect, mock, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonTo3D, convertSceneToGLTF } from "../../lib/index"

const lcdPath = "./mechanical/cad/lcd-module.obj"

async function renderClassicF1() {
  // The published Classic F1 board outline and LCD placement with a reduced mesh.
  const circuitJson: CircuitJson = await Bun.file(
    new URL("../fixtures/classic-f1-lcd.circuit.json", import.meta.url),
  ).json()
  const lcd = Bun.file(
    new URL("../fixtures/classic-f1-lcd.obj", import.meta.url),
  )
  const server = Bun.serve({
    port: 0,
    hostname: "127.0.0.1",
    fetch: (request) =>
      new URL(request.url).pathname === "/assets/lcd-module.obj"
        ? new Response(lcd)
        : new Response("# The unresolved package URL has no model geometry\n"),
  })

  try {
    const resolveStaticAsset = mock((path: string) =>
      path === lcdPath
        ? new URL("assets/lcd-module.obj", server.url).href
        : path,
    )
    const options = {
      projectBaseUrl: server.url.href,
      renderBoardTextures: false,
      resolveStaticAsset,
    }
    const scene = await convertCircuitJsonTo3D(circuitJson, options)
    return { scene, resolveStaticAsset }
  } finally {
    await server.stop(true)
  }
}

test("matches the Classic F1 relative LCD model snapshot", async () => {
  const { scene } = await renderClassicF1()
  const glb = await convertSceneToGLTF(scene, { binary: true })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected a binary glTF")
  const png = await renderGLTFToPNGFromGLB(glb, {
    width: 480,
    height: 420,
    backgroundColor: "#f2f3f5",
    camPos: [80, 100, 80],
    lookAt: [0, 0, 0],
  })
  await expect(png).toMatchPngSnapshot(import.meta.path, undefined, {
    maxDiffFraction: 0.002,
  })
})

test("resolves Classic F1's release-relative LCD OBJ", async () => {
  const { scene, resolveStaticAsset } = await renderClassicF1()
  expect(resolveStaticAsset.mock.calls).toEqual([[lcdPath]])
  const lcd = scene.boxes.find(
    (box) => box.componentMetadata?.cad_component_id === "cad_component_58",
  )
  expect(lcd?.mesh?.triangles.length).toBeGreaterThan(0)
})
