import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D, convertSceneToGLTF } from "../../lib"
import { renderGlbToPng } from "../renderGlbToPng"

test.failing("a through via leaves no substrate across its drill axis", async () => {
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board",
      center: { x: 0, y: 0 },
      width: 10,
      height: 8,
      thickness: 1.6,
      num_layers: 4,
      material: "fr4",
    },
    {
      type: "pcb_via",
      pcb_via_id: "via",
      x: 1,
      y: 1,
      outer_diameter: 3,
      hole_diameter: 2,
      layers: ["top", "inner1", "inner2", "bottom"],
      from_layer: "top",
      to_layer: "bottom",
      tented_on_top: false,
      tented_on_bottom: false,
    },
  ]
  const scene = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
  })
  const mesh = scene.boxes[0]!.mesh!
  // Scene coordinates are +Y-up mm: Circuit JSON +Y maps to scene +Z.
  const coveringFaces = mesh.triangles.filter((triangle) => {
    if (!triangle.vertices.every((vertex) => Math.abs(vertex.y - 0.8) < 1e-6))
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
  const glb = (await convertSceneToGLTF(scene, { binary: true })) as ArrayBuffer
  const boardPng = await renderGlbToPng(
    glb,
    circuitJson,
    { width: 800, height: 400, backgroundColor: [1, 1, 1] },
    { direction: [0, 1, -0.001], ortho: true, aspectRatio: 2 },
  )
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><rect width="800" height="500" fill="white"/><g fill="#222" font-family="sans-serif" font-size="17" text-anchor="middle"><text x="400" y="30">GLTF converts Circuit JSON to a 3D PCB substrate.</text><text x="400" y="60">2 mm through drill: ${coveringFaces.length} substrate faces cover its axis. Expected 0.</text></g><image y="90" width="800" height="400" href="data:image/png;base64,${Buffer.from(boardPng).toString("base64")}"/></svg>`
  if (process.env.EVIDENCE_DIR) {
    await Bun.write(
      `${process.env.EVIDENCE_DIR}/observed.png`,
      new Resvg(svg).render().asPng(),
    )
    await Bun.write(
      `${process.env.EVIDENCE_DIR}/mesh.json`,
      JSON.stringify(mesh),
    )
  }
  expect(coveringFaces).toHaveLength(0)
}, 30_000)
