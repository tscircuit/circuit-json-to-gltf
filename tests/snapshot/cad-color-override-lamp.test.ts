import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import lampJson from "../fixtures/reference-surface-lamp.json"
import { renderLampPanels } from "../fixtures/render-lamp-panels"

const lamp = lampJson as CircuitJson

test("PoppyGL preserves authored lamp colors by default and applies explicit CAD color overrides", async () => {
  const authored: CircuitJson = lamp.map((e) =>
    e.type === "cad_component" ? { ...e, color: undefined } : e,
  )
  const shadeSource = lamp
    .filter((e) => e.type === "source_component")
    .find((e) => e.name === "SHADE")!
  const stemSource = lamp
    .filter((e) => e.type === "source_component")
    .find((e) => e.name === "STEM")!
  const overridden: CircuitJson = authored.map((e) => {
    if (e.type !== "cad_component") return e
    if (e.source_component_id === shadeSource.source_component_id)
      return { ...e, color: "#9955dd" }
    if (e.source_component_id === stemSource.source_component_id)
      return { ...e, color: "#22aa77" }
    return e
  })
  await expect(
    await renderLampPanels([
      {
        label: "Authored JSCAD: amber shade and blue stem",
        circuitJson: authored,
      },
      {
        label: "CAD overrides: purple shade and green stem",
        circuitJson: overridden,
      },
    ]),
  ).toMatchPngSnapshot(import.meta.path)
})
