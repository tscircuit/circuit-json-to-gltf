import { expect, test } from "bun:test"
import { Circuit } from "@tscircuit/core"
import { ViaTentingVariants } from "../../examples/via-tenting-variants"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGlbToPng } from "../renderGlbToPng"

test("TSX via variants render board defaults, overrides, text and pad overlap in one GLB", async () => {
  const circuit = new Circuit()
  circuit.add(<ViaTentingVariants />)
  await circuit.renderUntilSettled()
  const circuitJson = circuit.getCircuitJson()

  // Verify that the TSX actually exercises inheritance and route-only vias.
  expect(
    circuitJson.find((element) => element.type === "pcb_board"),
  ).toMatchObject({
    default_via_tented_on_top: true,
    default_via_tented_on_bottom: false,
  })
  const standaloneVias = circuitJson.filter(
    (element) => element.type === "pcb_via",
  )
  expect(standaloneVias).toHaveLength(7)
  expect(
    standaloneVias.find((via) => via.x === -44 && via.y === 8),
  ).toMatchObject({
    tented_on_top: undefined,
    tented_on_bottom: undefined,
  })
  const routeVias = circuitJson.flatMap((element) =>
    element.type === "pcb_trace"
      ? element.route.filter((point) => point.route_type === "via")
      : [],
  )
  expect(routeVias).toHaveLength(5)

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    includeModels: false,
    boardTextureResolution: 2048,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")

  // Keep the exact rendered model available for manual inspection/download.
  await Bun.write(
    new URL("../../out/via-tenting-variants.glb", import.meta.url),
    glb,
  )
  const renderOptions = {
    width: 1600,
    height: 1200,
    supersampling: 2,
    ambient: 0.55,
    lightDir: [0, 1, 0],
    backgroundColor: [1, 1, 1],
  }

  // Same +Y-up top view as via-tenting.test.ts. PCB +Y maps to GLTF +Z.
  const top = await renderGlbToPng(glb, circuitJson, renderOptions, {
    direction: [0, 1, -1e-3],
    ortho: true,
    aspectRatio: 4 / 3,
  })
  await expect(top).toMatchPngSnapshot(
    import.meta.path,
    "via-tenting-variants-top",
  )

  // camera-position.ts's bottom_up preset keeps bottom labels upright.
  const bottom = await renderGlbToPng(
    glb,
    circuitJson,
    { ...renderOptions, lightDir: [0, -1, 0] },
    { preset: "bottom_up", ortho: true, aspectRatio: 4 / 3 },
  )
  await expect(bottom).toMatchPngSnapshot(
    import.meta.path,
    "via-tenting-variants-bottom",
  )

  const angled = await renderGlbToPng(glb, circuitJson, renderOptions, {
    direction: [-0.4, 1, -0.8],
    ortho: true,
    aspectRatio: 4 / 3,
  })
  await expect(angled).toMatchPngSnapshot(
    import.meta.path,
    "via-tenting-variants-angled",
  )
}, 30_000)
