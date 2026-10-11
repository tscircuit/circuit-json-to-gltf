import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import { Circuit } from "@tscircuit/core"
import type { STLMesh } from "../../lib/types"
import { convertCircuitJsonTo3D, convertSceneToGLTF } from "../../lib"
import { renderGlbToPng } from "../renderGlbToPng"

// Scene coordinates are +Y-up mm: Circuit JSON +Y maps to scene +Z.
const facesAcrossDrill = (mesh: STLMesh, surfaceY: number) =>
  mesh.triangles.filter((triangle) => {
    if (
      !triangle.vertices.every((vertex) => Math.abs(vertex.y - surfaceY) < 1e-6)
    )
      return false
    const signs = triangle.vertices.map((a, index) => {
      const b = triangle.vertices[(index + 1) % 3]!
      return (b.x - a.x) * (1 - a.z) - (b.z - a.z) * (1 - a.x)
    })
    return (
      signs.every((sign) => sign >= -1e-9) ||
      signs.every((sign) => sign <= 1e-9)
    )
  })

test("a through via leaves no substrate across its drill axis", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board
      width={10}
      height={8}
      thickness={1.6}
      layers={4}
      routingDisabled
      schematicDisabled
    >
      <via
        name="V1"
        pcbX={1}
        pcbY={1}
        holeDiameter={2}
        outerDiameter={3}
        fromLayer="top"
        toLayer="bottom"
        tented={false}
      />
    </board>,
  )
  await circuit.renderUntilSettled()
  const circuitJson = circuit.getCircuitJson()
  const vias = circuitJson.filter((element) => element.type === "pcb_via")
  expect(vias).toHaveLength(1)
  expect(vias[0]).toMatchObject({
    x: 1,
    y: 1,
    hole_diameter: 2,
    outer_diameter: 3,
    layers: ["top", "inner1", "inner2", "bottom"],
    from_layer: "top",
    to_layer: "bottom",
    tented_on_top: false,
    tented_on_bottom: false,
  })
  expect(
    circuitJson.find((element) => element.type === "pcb_board"),
  ).toMatchObject({
    width: 10,
    height: 8,
    thickness: 1.6,
    num_layers: 4,
  })
  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
  })
  const mesh = scene.boxes[0]!.mesh!
  const coveringFaces = facesAcrossDrill(mesh, 0.8)
  const glb = (await convertSceneToGLTF(scene, { binary: true })) as ArrayBuffer
  const boardPng = await renderGlbToPng(
    glb,
    circuitJson,
    { width: 800, height: 400, backgroundColor: [1, 1, 1] },
    { direction: [0, 1, -0.001], ortho: true, aspectRatio: 2 },
  )
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="white"/><g fill="#222" font-family="sans-serif" font-size="17" text-anchor="middle"><text x="400" y="30">GLTF converts Circuit JSON to a 3D PCB substrate.</text><text x="400" y="60">2 mm through drill: ${coveringFaces.length} substrate faces cover its axis. Expected 0.</text></g><image y="90" width="800" height="400" href="data:image/png;base64,${Buffer.from(boardPng).toString("base64")}"/></svg>`
  const png = new Resvg(svg).render().asPng()
  expect(coveringFaces).toHaveLength(0)
  await expect(png).toMatchPngSnapshot(import.meta.path)
}, 30_000)

test("a top-to-inner1 via keeps substrate across its bottom drill axis", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board
      width={10}
      height={8}
      thickness={1.6}
      layers={4}
      routingDisabled
      schematicDisabled
    >
      <via
        name="V1"
        pcbX={1}
        pcbY={1}
        holeDiameter={2}
        outerDiameter={3}
        fromLayer="top"
        toLayer="inner1"
        tented={false}
      />
    </board>,
  )
  await circuit.renderUntilSettled()
  const circuitJson = circuit.getCircuitJson()
  const vias = circuitJson.filter((element) => element.type === "pcb_via")
  expect(vias).toHaveLength(1)
  expect(vias[0]).toMatchObject({
    x: 1,
    y: 1,
    hole_diameter: 2,
    outer_diameter: 3,
    layers: ["top", "inner1"],
    from_layer: "top",
    to_layer: "inner1",
  })
  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
  })
  expect(facesAcrossDrill(scene.boxes[0]!.mesh!, -0.8).length).toBeGreaterThan(
    0,
  )
  const glb = (await convertSceneToGLTF(scene, { binary: true })) as ArrayBuffer
  const boardPng = await renderGlbToPng(
    glb,
    circuitJson,
    {
      width: 800,
      height: 400,
      backgroundColor: [1, 1, 1],
      lightDir: [0, -1, 0],
    },
    { direction: [0, -1, -0.001], ortho: true, aspectRatio: 2 },
  )
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="white"/><g fill="#222" font-family="sans-serif" font-size="17" text-anchor="middle"><text x="400" y="30">GLTF bottom surface of a top-to-inner1 via.</text><text x="400" y="60">The partial-span drill must leave the bottom substrate closed.</text></g><image y="90" width="800" height="400" href="data:image/png;base64,${Buffer.from(boardPng).toString("base64")}"/></svg>`
  await expect(new Resvg(svg).render().asPng()).toMatchPngSnapshot(
    import.meta.path,
    "partial-span-via-bottom-substrate",
  )
}, 30_000)
