import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { laserEngravedParts } from "../fixtures/laser-engraved-parts"
import { renderLampPanels } from "../fixtures/render-lamp-panels"

// Cameras are points in exported glTF world: +Y up, mm, and glTF X is circuit
// -X. A camera at negative glTF Z therefore looks from the circuit -Y side with
// circuit +X to its right, which is the side the top text is read from.
test("PoppyGL draws laser-engraved text on part tops and walls, reading the right way round", async () => {
  const lidOnly = (laserEngravedParts as { source_component_id?: string }[])
    .filter((e) => e.source_component_id === "source_component_0")
    .map((e) => e as CircuitJson[number])
  const png = await renderLampPanels([
    {
      label: "Dark lid: pale derived marks. Pale plate: dark derived mark",
      circuitJson: laserEngravedParts,
      camPos: [-12, 95, -120],
      lookAt: [-22, 2, 0],
    },
    {
      label: "From above: centered, corner-anchored and rotated text",
      circuitJson: laserEngravedParts,
      camPos: [-20, 150, -1],
      lookAt: [-20, 0, 0],
    },
    {
      label: "Wall facing -Y: a stated brass resulting color",
      circuitJson: laserEngravedParts,
      camPos: [0, 24, -104],
      lookAt: [0, 4, 0],
    },
    {
      label: "Wall facing +X: text reads toward +Y, upright",
      circuitJson: lidOnly,
      camPos: [-80, 22, -22],
      lookAt: [-30, 5, 0],
    },
  ])
  // All the text together is under 0.5% of the image, so the matcher's default
  // 5% allowance would still pass with every mark missing. Removing the marks
  // changes 0.48% of pixels and reversing them 0.73%; this allowance is below
  // both.
  await expect(png).toMatchPngSnapshot(import.meta.path, undefined, {
    maxDiffFraction: 0.002,
  })
})
