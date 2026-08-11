import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { renderBoardLayer } from "../../lib"

const circuitJson: CircuitJson = [
  {
    type: "pcb_board",
    pcb_board_id: "board_custom_colors",
    center: { x: 0, y: 0 },
    width: 20,
    height: 10,
    thickness: 1.6,
    num_layers: 2,
    material: "fr4",
    solder_mask_color: "#aeb8c6",
    silkscreen_color: "#ffffff",
  },
  {
    type: "pcb_trace",
    pcb_trace_id: "trace_custom_colors",
    route: [
      { route_type: "wire", x: -7, y: 0, width: 1, layer: "top" },
      { route_type: "wire", x: 7, y: 0, width: 1, layer: "top" },
    ],
  },
]

test("derives board texture colors from pcb_board metadata", async () => {
  const dataUrl = await renderBoardLayer(circuitJson, {
    layer: "top",
    resolution: 320,
  })

  const png = Buffer.from(dataUrl.split(",")[1]!, "base64")
  expect(png).toMatchPngSnapshot(import.meta.path)
})
