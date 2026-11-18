import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"
import { assemblyExplosion } from "../fixtures/assembly-explosion"

// The gold bolt (cad_1) carries a mark on its head; the base (cad_0) carries
// one too. Circuit world is right-handed, +Z up, mm.
const mark = (id: string, cad: number, z: number) => ({
  type: "cad_laser_engraving_text",
  cad_laser_engraving_text_id: id,
  source_component_id: `source_${cad}`,
  cad_component_id: `cad_${cad}`,
  text: "M3",
  font_size: 1.5,
  anchor_position: { x: cad ? 6 : -8, y: cad ? 7 : -8, z },
  normal: { x: 0, y: 0, z: 1 },
  x_axis: { x: 1, y: 0, z: 0 },
})
const circuit = [
  ...assemblyExplosion,
  mark("on-bolt", 1, 12),
  mark("on-base", 0, 1),
] as unknown as CircuitJson

test("an engraved mark moves with its exploded component and stays put otherwise", async () => {
  const centers = async (explosion?: object) => {
    const boxes = (await convertCircuitJsonTo3D(circuit, { explosion })).boxes
    const center = (match: (label: string) => boolean) =>
      boxes.find((box) => match(box.label ?? ""))!.center
    return {
      bolt: boxes.find(
        (box) => box.componentMetadata?.cad_component_id === "cad_1",
      )!.center,
      boltMark: center((label) => label.startsWith("gold-bolt engraving")),
      baseMark: center((label) => label.startsWith("base engraving")),
    }
  }
  const assembled = await centers()
  const exploded = await centers({})

  const boltMove = {
    x: exploded.bolt.x - assembled.bolt.x,
    y: exploded.bolt.y - assembled.bolt.y,
    z: exploded.bolt.z - assembled.bolt.z,
  }
  // The explosion really moves the bolt, so an unmoved mark would be detected.
  expect(Math.hypot(boltMove.x, boltMove.y, boltMove.z)).toBeGreaterThan(5)
  for (const axis of ["x", "y", "z"] as const) {
    expect(exploded.boltMark[axis] - assembled.boltMark[axis]).toBeCloseTo(
      boltMove[axis],
      6,
    )
    expect(exploded.baseMark[axis]).toBeCloseTo(assembled.baseMark[axis], 9)
  }
})
