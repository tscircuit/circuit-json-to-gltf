import { expect, test } from "bun:test"
import { Circuit, assembly } from "@tscircuit/core"
import { convertCircuitJsonToGltf } from "../../../lib"
import { renderGlbToPng } from "../../renderGlbToPng"

const OledBoard = () => (
  <assembly.device name="oled-board">
    <board name="B1" width={44} height={36} routingDisabled>
      <connector
        name="J1"
        pinCount={30}
        pcbY={-13}
        footprint="fpc30_p0.5mm_pw0.3mm_pl1.25mm_mpx17.58mm_mpy2.325mm_mpw2mm_mpl3mm_mounttop"
      />
      <resistor name="R1" resistance="10k" footprint="0603" pcbX={-17} />
    </board>
    <assembly.subassembly name="display">
      <assembly.screen
        name="SCREEN"
        connectsTo=".B1 .J1"
        cadModel="flexscreen_w26.7mm_h19.26mm_screenthickness1.45mm_bezelinset1mm_bezeldepth0.5mm_activew21.744mm_activeh10.864mm_flex12mm_flexwidth15.5mm_flexthickness0.3mm_conductors30_conductorpitch0.5mm_conductorwidth0.3mm_edgemargin0.35mm_contactlength4mm_stiffenerlength4.5mm_stiffenerthickness0.12mm_sitsflat_cablestarty4.285mm_cablestartz1.1mm_hideconductors_screencolor(#071c18)_bezelcolor(#171a1d)"
      />
    </assembly.subassembly>
  </assembly.device>
)

export default OledBoard

test("assembly screen renders beside real PCB components without a PCB owner", async () => {
  const circuit = new Circuit()
  circuit.add(<OledBoard />)
  await circuit.renderUntilSettled()
  const circuitJson = circuit.getCircuitJson()
  const screenSource = circuit.db.source_component
    .list()
    .find((c) => c.name === "SCREEN")!
  const screenCad = circuit.db.cad_component
    .list()
    .find((c) => c.source_component_id === screenSource.source_component_id)!

  expect(screenCad).toBeDefined()
  expect(screenCad.pcb_component_id).toBeUndefined()
  expect(circuit.db.pcb_component.list()).toHaveLength(2)

  const glb = await convertCircuitJsonToGltf(circuitJson, { format: "glb" })
  const png = await renderGlbToPng(glb as ArrayBuffer, circuitJson, {
    camPos: [45, 38, 55],
    lookAt: [0, 0, 0],
    backgroundColor: [1, 1, 1],
    grid: false,
  })
  await expect(png).toMatchPngSnapshot(import.meta.path)
})
