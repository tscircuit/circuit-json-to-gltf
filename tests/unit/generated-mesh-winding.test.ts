import { expect, test } from "bun:test"
import type { CadCable, PcbBoard, PcbHole, PcbPanel } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib/converters/circuit-to-3d"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"
import { loadCable } from "../../lib/loaders/cable"
import { loadFootprinterModel } from "../../lib/loaders/footprinter"
import type { Box3D, STLMesh } from "../../lib/types"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import { createBoardMesh } from "../../lib/utils/pcb-board-geometry"
import { createPanelMesh } from "../../lib/utils/pcb-panel-geometry"
import { assertOutward, readExportedTriangles } from "../fixtures/outward-mesh"

async function assertExport(boxes: Box3D[], volume: number) {
  const glb = (await convertSceneToGLTF(
    { boxes },
    { binary: true },
  )) as ArrayBuffer
  assertOutward(readExportedTriangles(glb), volume)
}

const boxForMesh = (mesh: STLMesh): Box3D => ({
  center: { x: 0, y: 0, z: 0 },
  size: {
    x: mesh.boundingBox.max.x - mesh.boundingBox.min.x,
    y: mesh.boundingBox.max.y - mesh.boundingBox.min.y,
    z: mesh.boundingBox.max.z - mesh.boundingBox.min.z,
  },
  mesh,
  color: "#879568",
})

for (const footprint of ["0402", "0603"])
  for (const [name, transform] of [
    ["identity", COORDINATE_TRANSFORMS.IDENTITY],
    ["component placement", COORDINATE_TRANSFORMS.FOOTPRINTER_MODEL_TRANSFORM],
  ] as const)
    test(`generated ${footprint} footprint preserves outward faces: ${name}`, async () => {
      // Run the real JSCAD -> GLB -> footprinter loader path.
      const mesh = await loadFootprinterModel(footprint, transform)
      expect(mesh).toBeDefined()
      const volume = assertOutward(mesh!.triangles)
      expect(volume).toBeGreaterThan(0)
      await assertExport([boxForMesh(mesh!)], volume)
    })

for (const cableprinterString of ["usb_c", "jst_sh_pins4"])
  test(`generated ${cableprinterString} cable parts preserve outward faces through GLB`, async () => {
    const cable: CadCable = {
      type: "cad_cable",
      cad_cable_id: "cable",
      name: cableprinterString,
      from_source_component_id: "connector_a",
      to_source_component_id: "connector_b",
      cableprinter_string: cableprinterString,
      path: [
        { x: 2, y: 3, z: 4 },
        { x: 2, y: 3, z: 44 },
      ],
    }
    const original = JSON.stringify(cable)
    const boxes = loadCable(cable)
    expect(boxes.length).toBeGreaterThan(2)
    const sweepCount = cableprinterString === "usb_c" ? 1 : 4
    const radius = cableprinterString === "usb_c" ? 2 : 0.3
    // A straight closed 24-sided sweep has area n*r^2*sin(2*pi/n)/2.
    const sweepVolume =
      (24 * radius ** 2 * Math.sin((2 * Math.PI) / 24) * 40) / 2
    let totalVolume = 0
    for (const [index, box] of boxes.entries()) {
      const volume = assertOutward(
        box.mesh!.triangles,
        index < sweepCount ? sweepVolume : undefined,
      )
      expect(volume).toBeGreaterThan(0)
      totalVolume += volume
    }
    await assertExport(boxes, totalVolume)
    expect(JSON.stringify(cable)).toBe(original)
  })

const panel: PcbPanel = {
  type: "pcb_panel",
  pcb_panel_id: "panel",
  center: { x: 12.5, y: -5.4 },
  width: 30,
  height: 18,
  thickness: 1.2,
  covered_with_solder_mask: true,
}
const panelHole = {
  type: "pcb_hole",
  pcb_hole_id: "panel_hole",
  x: panel.center.x + 2,
  y: panel.center.y + 1,
  hole_shape: "rect",
  hole_width: 4,
  hole_height: 2,
} as unknown as PcbHole
const panelVolume = (30 * 18 - 4 * 2) * 1.2

test("CSG panel generation preserves outward caps and hole walls", async () => {
  const mesh = createPanelMesh(panel, {
    thickness: 1.2,
    holes: [panelHole],
  })
  assertOutward(mesh.triangles, panelVolume)
  await assertExport([boxForMesh(mesh)], panelVolume)
})

for (const texture of [false, true])
  test(`panel conversion preserves outward faces through GLB: textures=${texture}`, async () => {
    const scene = await convertCircuitJsonTo3D([panel, panelHole], {
      boardThickness: 1.2,
      renderBoardTextures: texture,
      textureResolution: 32,
    })
    expect(scene.boxes).toHaveLength(1)
    assertOutward(scene.boxes[0]!.mesh!.triangles, panelVolume)
    if (texture) expect(scene.boxes[0]!.texture?.top).toBeDefined()
    await assertExport(scene.boxes, panelVolume)
  })

test("board boundary-crossing hole fallback keeps a closed outward solid", async () => {
  const board: PcbBoard = {
    type: "pcb_board",
    pcb_board_id: "boundary_board",
    center: { x: 11, y: -7 },
    width: 20,
    height: 10,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
  }
  const crossingHole = {
    type: "pcb_hole",
    pcb_hole_id: "crossing_hole",
    // The 4 x 2 mm cut protrudes 1.5 mm beyond the right board edge.
    x: board.center.x + 9.5,
    y: board.center.y + 2,
    hole_shape: "rect",
    hole_width: 4,
    hole_height: 2,
  } as unknown as PcbHole
  const volume = (20 * 10 - 2.5 * 2) * 1.6
  const mesh = createBoardMesh(board, {
    thickness: 1.6,
    holes: [crossingHole],
  })
  assertOutward(mesh.triangles, volume)
  // The notch closes at x=7.5 mm with its wall facing the removed +X region.
  expect(
    mesh.triangles.some(
      (triangle) =>
        triangle.normal.x > 0.99 &&
        triangle.vertices.every((point) => Math.abs(point.x - 7.5) < 1e-6),
    ),
  ).toBe(true)
  await assertExport([boxForMesh(mesh)], volume)
})
