import { expect, test } from "bun:test"
import type { CadCable } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"

test("generic adapter strings render mixed connector families and native contact pitches", async () => {
  for (const [a, b, count] of [
    ["bullet3_d3.5mm_gfemale", "jst_ph_pins3", 3],
    ["jst_sh_pins4", "jst_ph_pins4", 4],
  ] as const) {
    const cable: CadCable = {
      type: "cad_cable",
      cad_cable_id: "cad_cable_adapter",
      name: "ADAPTER",
      from_source_component_id: "a",
      to_source_component_id: "b",
      cableprinter_string: `adaptercable_a(${a})_b(${b})`,
      path: [
        { x: 0, y: 0, z: 0 },
        { x: 0, y: 0, z: 70 },
      ],
    }
    const scene = await convertCircuitJsonTo3D([cable], {
      drawFauxBoard: false,
      renderBoardTextures: false,
    })
    expect(
      scene.boxes.filter((box) => /wire-[1-4]$/.test(box.label ?? "")),
    ).toHaveLength(count)
    expect(
      scene.boxes.filter((box) =>
        /A-(?:bullet-socket|contact)-[1-4]$/.test(box.label ?? ""),
      ),
    ).toHaveLength(count)
    expect(
      scene.boxes.filter((box) => /B-contact-[1-4]$/.test(box.label ?? "")),
    ).toHaveLength(count)
    const glb = await convertCircuitJsonToGltf([cable], {
      format: "glb",
      drawFauxBoard: false,
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
    expect(new DataView(glb).getUint32(0, true)).toBe(0x46546c67)
    expect(new DataView(glb).getUint32(8, true)).toBe(glb.byteLength)
  }
})
