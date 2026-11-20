import { expect, test } from "bun:test"
import type { CadComponent, PcbComponent, PcbSmtPad } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

// J1 from imrishabh18/rp2040-motor-controller v1.0.58. The six synthetic
// OBJ contact faces reproduce the C265102 solder geometry in model-local
// millimetres, with +Z up. The fixture needs no supplier model download.
const contacts = [
  ...[-3, -1, 1, 3].map((x) => [x - 0.2, x + 0.2, 4.95, 6.65]),
  [-5.2, -5.05, -1.65, 1.6],
  [5.05, 5.2, -1.65, 1.6],
]
const obj = contacts
  .map(([minX, maxX, minY, maxY], i) => {
    const first = i * 4 + 1
    return [
      `v ${minX} ${minY} 0.05`,
      `v ${maxX} ${minY} 0.05`,
      `v ${maxX} ${maxY} 0.05`,
      `v ${minX} ${maxY} 0.05`,
      `f ${first} ${first + 1} ${first + 2} ${first + 3}`,
    ].join("\n")
  })
  .join("\n")

const pcb: PcbComponent = {
  type: "pcb_component",
  pcb_component_id: "pcb_j1",
  source_component_id: "source_j1",
  center: { x: 16.15, y: -4.2 },
  footprint_origin: { x: 16.1, y: -4.2 },
  width: 9.575,
  height: 12.5,
  layer: "top",
  rotation: 270,
  obstructs_within_bounds: true,
}

const cad: CadComponent = {
  type: "cad_component",
  cad_component_id: "cad_j1",
  pcb_component_id: pcb.pcb_component_id,
  source_component_id: pcb.source_component_id,
  position: { x: 19.0875, y: -4.2, z: 0.75 },
  rotation: { x: 0, y: 0, z: 90 },
  model_origin_alignment: "center_of_component_on_board_surface",
  anchor_alignment: "center_of_component_on_board_surface",
  model_object_fit: "contain_within_bounds",
  model_obj_url: `data:text/plain;base64,${Buffer.from(obj).toString("base64")}`,
}

const pads: Extract<PcbSmtPad, { shape: "rect" }>[] = [
  ...[-7.2, -5.2, -3.2, -1.2].map((y, i) => ({
    x: 13.1125,
    y,
    width: 3.5,
    height: 1,
    port_hints: [String(i + 1)],
  })),
  ...[-9.55, 1.15].map((y) => ({
    x: 19.0875,
    y,
    width: 3.7,
    height: 1.8,
    port_hints: [],
  })),
].map((pad, index) => ({
  ...pad,
  type: "pcb_smtpad",
  pcb_smtpad_id: `pad_j1_${index}`,
  pcb_component_id: pcb.pcb_component_id,
  layer: "top",
  shape: "rect",
}))

async function expectContactsOnPads(component: CadComponent) {
  const glb = await convertCircuitJsonToGltf([pcb, component, ...pads], {
    format: "glb",
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary glTF")

  const { triangles } = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY)
  expect(triangles).toHaveLength(12)

  // Exported world points are +Y-up, in millimetres, with circuit +X at glTF -X.
  // Assign each contact face to the copper pad that contains all its vertices.
  const counts = pads.map(
    (pad) =>
      triangles.filter(({ vertices }) =>
        vertices.every(
          ({ x, y, z }) =>
            Math.abs(-x - pad.x) <= pad.width / 2 &&
            Math.abs(z - pad.y) <= pad.height / 2 &&
            Math.abs(y - 0.8) < 1e-6,
        ),
      ).length,
  )
  expect(counts).toEqual([2, 2, 2, 2, 2, 2])
}

test.failing("exported J1 OBJ contacts land on the six PCB pads", async () => {
  await expectContactsOnPads(cad)
})

test("an explicit OBJ origin aligns the exported J1 contacts", async () => {
  await expectContactsOnPads({
    ...cad,
    position: { x: 18.0875, y: -4.2, z: 0.8 },
    model_origin_position: { x: 0, y: 1, z: 0.05 },
  })
})
