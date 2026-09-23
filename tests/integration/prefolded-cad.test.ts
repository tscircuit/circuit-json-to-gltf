import { expect, test } from "bun:test"
import { transformCircuitJsonCadComponents } from "@tscircuit/flex-utils"
import type { AnyCircuitElement } from "circuit-json"
import { convertCircuitJsonTo3D } from "../../lib"
import { createThreeDiscFlex } from "../../examples/three-disc-flex"

test("flat and pre-folded CAD input produce the same selected output pose", async () => {
  const flat = createThreeDiscFlex() as AnyCircuitElement[]
  for (const element of flat)
    if (element.type === "cad_component")
      element.rotation = { x: 17, y: 29, z: 37 }
  const lastCad = [...flat].reverse().find((e) => e.type === "cad_component")
  if (lastCad?.type === "cad_component") {
    lastCad.rotation = undefined
    lastCad.layer = "bottom"
    lastCad.position.z = -Math.abs(lastCad.position.z)
  }
  const assembled = transformCircuitJsonCadComponents(flat, { foldPcbs: true })
  const before = JSON.stringify(assembled)
  for (const foldPcbs of [false, true]) {
    const a = await convertCircuitJsonTo3D(flat, {
      foldPcbs,
      renderBoardTextures: false,
    })
    const b = await convertCircuitJsonTo3D(assembled, {
      foldPcbs,
      renderBoardTextures: false,
    })
    expect(b.boxes.map((box) => box.label)).toEqual(
      a.boxes.map((box) => box.label),
    )
    for (let i = 0; i < a.boxes.length; i++) {
      const original = a.boxes[i]!,
        restored = b.boxes[i]!
      for (const key of ["x", "y", "z"] as const)
        expect(restored.center[key]).toBeCloseTo(original.center[key], 7)
      if (original.rotation)
        for (const key of ["x", "y", "z"] as const)
          expect(restored.rotation![key]).toBeCloseTo(original.rotation[key], 7)
      if (original.mesh) {
        expect(restored.mesh!.triangles.length).toBe(
          original.mesh.triangles.length,
        )
        for (let j = 0; j < original.mesh.triangles.length; j += 37)
          for (let v = 0; v < 3; v++)
            for (const key of ["x", "y", "z"] as const)
              expect(
                restored.mesh!.triangles[j]!.vertices[v]![key],
              ).toBeCloseTo(original.mesh.triangles[j]!.vertices[v]![key], 6)
      }
    }
  }
  for (const [input, foldPcbs] of [
    [flat, false],
    [assembled, true],
  ] as const) {
    const expected = await convertCircuitJsonTo3D(input, {
      foldPcbs,
      renderBoardTextures: false,
    })
    const automatic = await convertCircuitJsonTo3D(input, {
      renderBoardTextures: false,
    })
    const undefinedOption = await convertCircuitJsonTo3D(input, {
      foldPcbs: undefined,
      renderBoardTextures: false,
    })
    expect(automatic).toEqual(expected)
    expect(undefinedOption).toEqual(expected)
  }
  expect(JSON.stringify(assembled)).toBe(before)
})
