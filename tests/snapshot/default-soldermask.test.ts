import { expect, test } from "bun:test"
import { renderBoardTextures } from "../../lib/converters/board-renderer"
import "../fixtures/preload"

test("default mask over a copper pour stays dark green", async () => {
  const circuit = [
    {
      type: "pcb_board",
      pcb_board_id: "board",
      center: { x: 0, y: 0 },
      width: 10,
      height: 10,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    {
      type: "pcb_copper_pour",
      pcb_copper_pour_id: "pour",
      layer: "top",
      shape: "rect",
      center: { x: 0, y: 0 },
      width: 6,
      height: 6,
      rotation: 0,
    },
  ]
  const { top } = await renderBoardTextures(circuit as any, { resolution: 128 })
  await expect(Buffer.from(top.split(",")[1]!, "base64")).toMatchPngSnapshot(
    import.meta.path,
  )
})
