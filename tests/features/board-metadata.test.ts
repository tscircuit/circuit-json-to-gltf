import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import {
  convertCircuitJsonTo3D,
  convertCircuitJsonToGltf,
  convertSceneToGLTF,
} from "../../lib"
import type { GLTF } from "../../lib/gltf/gltf-types"
import type { CircuitJsonWithPcbFlex } from "../../lib/types"
import { padOverlappingVia } from "../fixtures/pad-overlapping-via"

const readGlbJson = (glb: ArrayBuffer): GLTF =>
  JSON.parse(
    new TextDecoder().decode(
      new Uint8Array(glb, 20, new DataView(glb).getUint32(12, true)),
    ),
  )

const nodeIdentities = (gltf: GLTF) =>
  gltf.nodes!.map((node) => ({
    name: node.name,
    tscircuit: node.extras?.tscircuit,
  }))

// padOverlappingVia has one via whose bore opens through a pad, so the board
// exports a separate "Via Plating" node next to the board body.
test("board body and via plating carry pcb_board_id in a textured GLB", async () => {
  const glb = (await convertCircuitJsonToGltf(padOverlappingVia, {
    format: "glb",
    boardTextureResolution: 64,
  })) as ArrayBuffer
  expect(nodeIdentities(readGlbJson(glb))).toEqual([
    { name: "Box0", tscircuit: { pcb_board_id: "board" } },
    { name: "Via Plating", tscircuit: { pcb_board_id: "board" } },
  ])
})

test("untextured boards carry their own pcb_board_id", async () => {
  // Scope the pad and via to "board" so only it exports via plating.
  const circuit: CircuitJson = [
    ...padOverlappingVia,
    {
      type: "pcb_board",
      pcb_board_id: "second",
      center: { x: 30, y: 5 },
      width: 6,
      height: 4,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
  ].map((e) =>
    e.type === "pcb_via" || e.type === "pcb_smtpad"
      ? { ...e, pcb_board_id: "board" }
      : e,
  ) as CircuitJson
  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })
  const gltf = (await convertSceneToGLTF(scene)) as GLTF
  expect(nodeIdentities(gltf)).toEqual([
    { name: "Box0", tscircuit: { pcb_board_id: "board" } },
    { name: "Via Plating", tscircuit: { pcb_board_id: "board" } },
    { name: "Box2", tscircuit: { pcb_board_id: "second" } },
  ])
})

test("a panel renders in place of its boards with the panel id", async () => {
  const scene = await convertCircuitJsonTo3D(
    [
      ...padOverlappingVia,
      {
        type: "pcb_panel",
        pcb_panel_id: "panel",
        thickness: 1.6,
        covered_with_solder_mask: true,
        center: { x: 10, y: 5 },
        width: 6,
        height: 4,
      },
    ] as CircuitJson,
    { renderBoardTextures: false },
  )
  const glb = (await convertSceneToGLTF(scene, {
    binary: true,
  })) as ArrayBuffer
  expect(nodeIdentities(readGlbJson(glb))).toEqual([
    { name: "Box0", tscircuit: { pcb_board_id: "panel" } },
    { name: "Via Plating", tscircuit: { pcb_board_id: "panel" } },
  ])
})

test("stiffeners carry the pcb_board_id of the board they stiffen", async () => {
  const circuit: CircuitJsonWithPcbFlex = [
    {
      type: "pcb_board",
      pcb_board_id: "flex",
      center: { x: 0, y: 0 },
      width: 40,
      height: 20,
      thickness: 0.12,
      num_layers: 2,
      material: "flex",
    } as CircuitJson[number],
    {
      type: "pcb_stiffener",
      pcb_stiffener_id: "stiffener",
      pcb_board_id: "flex",
      layer: "bottom",
      shape: "rect",
      center: { x: 12, y: 0 },
      width: 10,
      height: 16,
      thickness: 0.2,
      material: "fr4",
    },
  ]
  const scene = await convertCircuitJsonTo3D(circuit, {
    renderBoardTextures: false,
  })
  const gltf = (await convertSceneToGLTF(scene)) as GLTF
  expect(nodeIdentities(gltf)).toEqual([
    { name: "Box0", tscircuit: { pcb_board_id: "flex" } },
    { name: "stiffener", tscircuit: { pcb_board_id: "flex" } },
  ])
})

test("faux boards have no board identity to export", async () => {
  const scene = await convertCircuitJsonTo3D([], {
    renderBoardTextures: false,
    drawFauxBoard: true,
  })
  const gltf = (await convertSceneToGLTF(scene)) as GLTF
  expect(gltf.nodes).toHaveLength(1)
  expect(gltf.nodes![0]!.extras?.tscircuit).toBeUndefined()
})
