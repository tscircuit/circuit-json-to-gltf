import { expect, test } from "bun:test"
import type { CadCable } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"

test("3.5 mm to 4 mm adapter GLBs preserve separate socket sizes and all three wires", async () => {
  const cable: CadCable = {
    type: "cad_cable",
    cad_cable_id: "cad_cable_adapter",
    name: "BLDC_PHASE_LEADS",
    from_source_component_id: "motor",
    to_source_component_id: "controller",
    cableprinter_string: "bullet3_da3.5mm_db4mm_afemale_bfemale",
    path: [
      { x: 0, y: 0, z: 0 },
      { x: 0, y: 0, z: 60 },
    ],
  }
  const scene = await convertCircuitJsonTo3D([cable], {
    drawFauxBoard: false,
    renderBoardTextures: false,
  })
  const sockets = (end: "A" | "B") =>
    scene.boxes.filter((box) =>
      new RegExp(`${end}-bullet-socket-[1-3]$`).test(box.label ?? ""),
    )
  expect(sockets("A")).toHaveLength(3)
  expect(sockets("B")).toHaveLength(3)
  expect(
    scene.boxes.filter((box) => /wire-[1-3]$/.test(box.label ?? "")),
  ).toHaveLength(3)
  const glb = await convertCircuitJsonToGltf([cable], {
    format: "glb",
    drawFauxBoard: false,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
  expect(new DataView(glb).getUint32(0, true)).toBe(0x46546c67)
  expect(new DataView(glb).getUint32(8, true)).toBe(glb.byteLength)
})
