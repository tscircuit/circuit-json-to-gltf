import { Circuit, resistor, fabricationnotetext, board } from "tscircuit"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../../lib"
import { getBestCameraPosition } from "../../../lib/utils/camera-position"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"

test("board-anchor-alignment", { timeout: 30000 }, async () => {
  const circuit = new Circuit()
  circuit.add(
    <board
      width="10mm"
      height="10mm"
      boardAnchorPosition={{ x: 0, y: 0 }}
      boardAnchorAlignment="bottom_left"
    >
      <resistor resistance="1k" footprint="0402" name="R1" pcbX={5} pcbY={5} />
      <fabricationnotetext
        text="(5,5)"
        anchorAlignment="bottom_left"
        fontSize="0.5mm"
        pcbX={5}
        pcbY={5}
      />
      <fabricationnotetext
        text="(10,10)"
        anchorAlignment="bottom_left"
        fontSize="0.5mm"
        pcbX={10}
        pcbY={10}
      />
      <fabricationnotetext
        text="(0,0)"
        anchorAlignment="bottom_left"
        fontSize="0.5mm"
        pcbX={0}
        pcbY={0}
      />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
  })

  const cameraOptions = {
    camPos: [15, 15, 15] as const,
    lookAt: [0, 0, 0] as const,
  }

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(glb as ArrayBuffer, cameraOptions),
  ).toMatchPngSnapshot(import.meta.path)
})
