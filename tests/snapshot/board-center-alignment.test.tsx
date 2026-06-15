import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGlbToPng } from "../renderGlbToPng"

test("board-center-alignment-3d-view", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board
      width="10mm"
      height="10mm"
      boardAnchorPosition={{ x: 0, y: 0 }}
      boardAnchorAlignment="bottom_left"
    >
      <resistor resistance="1k" footprint="0402" name="R1" pcbX={2} pcbY={2} />

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
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  const pngBuffer = await renderGlbToPng(glb as ArrayBuffer, circuitJson)

  expect(pngBuffer).toMatchPngSnapshot(
    import.meta.path,
    "board-center-alignment-3d-view",
  )
})
