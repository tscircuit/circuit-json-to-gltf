import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import lampJson from "../fixtures/reference-surface-lamp.json"
import { renderLampPanels } from "../fixtures/render-lamp-panels"

// Captured from core's ReferenceSurfaceLamp (shadeGap=60): real JSCAD base,
// hollow stem, bulb, and hollow shade with a collar and three support spokes.
// Circuit JSON geometry is right-handed XYZ, +Z up, mm; reference centers are
// absolute world points, normal/X axes are unit directions, not rotations.
const lamp = lampJson as CircuitJson

test("PoppyGL shows lamp mounting frames only when enabled, including the shade's downward frame", async () => {
  const shadeSource = lamp
    .filter((e) => e.type === "source_component")
    .find((e) => e.name === "SHADE")!
  const shade = lamp.filter(
    (e) =>
      "source_component_id" in e &&
      e.source_component_id === shadeSource.source_component_id,
  )
  const frames = lamp.filter(
    (e) => e.type === "source_component" || e.type === "cad_reference_surface",
  )
  const png = await renderLampPanels([
    {
      label: "Default: exploded lamp without reference surfaces",
      circuitJson: lamp,
    },
    {
      label: "Enabled: cyan frames, names, and orange normals",
      circuitJson: lamp,
      showReferenceSurfaces: true,
    },
    {
      label: "Underside: shade collar and downward mounting normal",
      circuitJson: shade,
      showReferenceSurfaces: true,
      camPos: [55, 72, 70],
      lookAt: [0, 152, 0],
    },
    {
      label: "Reference frames remain visible without CAD models",
      circuitJson: frames,
      showReferenceSurfaces: true,
    },
  ])
  await expect(png).toMatchPngSnapshot(import.meta.path)
})
