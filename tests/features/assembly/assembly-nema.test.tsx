import { expect, test } from "bun:test"
import { Circuit, assembly } from "@tscircuit/core"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../../lib"

for (const [model, width, length, shaftLength] of [
  ["nema8", 20.3, 33, 15],
  ["nema17", 42.3, 38, 24],
  ["nema23", 56.4, 51, 20.6],
] as const) {
  test(`exports standalone ${model} assembly geometry at its mounting-face origin`, async () => {
    const circuit = new Circuit()
    circuit.add(
      <assembly.device name="motor-controller">
        <board width={42.3} height={42.3} routingDisabled />
        <assembly.subassembly name="MOTOR" cadModel={model} />
      </assembly.device>,
    )
    await circuit.renderUntilSettled()
    const json = circuit.getCircuitJson()
    const cad = circuit.db.cad_component.list()[0]!
    expect(cad.pcb_component_id).toBeUndefined()
    expect(circuit.db.pcb_component.list()).toHaveLength(0)
    expect(cad.footprinter_string).toBe(model)

    const scene = await convertCircuitJsonTo3D(json, {
      renderBoardTextures: false,
    })
    const motor = scene.boxes.find((box) => box.label === "MOTOR")!
    expect(motor.mesh).toBeDefined()
    const bounds = motor.mesh!.boundingBox
    // Circuit +Z maps to scene +Y, in millimeters. Probe actual generated
    // bounds: mounting face 0, body -length, shaft +shaftLength.
    expect(bounds.max.x - bounds.min.x).toBeCloseTo(width, 3)
    expect(bounds.min.y).toBeCloseTo(-length, 5)
    expect(bounds.max.y).toBeCloseTo(shaftLength, 5)
    const glb = await convertCircuitJsonToGltf(json, { format: "glb" })
    expect(new DataView(glb as ArrayBuffer).getUint32(0, true)).toBe(0x46546c67)
  })
}
