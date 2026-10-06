import { expect, test } from "bun:test"
import type { CadCable } from "circuit-json"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"

test("bullet strings produce distinct gold pin and socket meshes in GLB exports", async () => {
  const cables: CadCable[] = [2, 3, 3.5, 4, 5, 5.5, 6, 8].map(
    (diameter, index) => ({
      type: "cad_cable",
      cad_cable_id: `cad_cable_${index}`,
      name: `BULLET_${diameter}`,
      from_source_component_id: `from_${index}`,
      to_source_component_id: `to_${index}`,
      cableprinter_string: `bullet_${diameter}mm_male_female`,
      path: [
        { x: index * 40, y: 0, z: 0 },
        { x: index * 40, y: 0, z: 60 },
      ],
    }),
  )
  const scene = await convertCircuitJsonTo3D(cables, {
    drawFauxBoard: false,
    renderBoardTextures: false,
  })
  expect(
    scene.boxes.filter((box) => box.label?.endsWith("A-bullet-pin")).length,
  ).toBe(8)
  expect(
    scene.boxes.filter((box) => box.label?.endsWith("B-bullet-socket")).length,
  ).toBe(8)
  const glb = await convertCircuitJsonToGltf(cables, {
    format: "glb",
    drawFauxBoard: false,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
  expect(new DataView(glb).getUint32(0, true)).toBe(0x46546c67)
  expect(new DataView(glb).getUint32(8, true)).toBe(glb.byteLength)
})
