import { expect, test } from "bun:test"
import { Circuit } from "@tscircuit/core"
import type { PcbTrace } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGlbToPng } from "../renderGlbToPng"

test("TSX via variants render board defaults, overrides, text and pad overlap in one GLB", async () => {
  const circuit = new Circuit()
  const inheritedRoute = [
    { route_type: "wire", x: -49, y: -8, layer: "top", width: 0.5 },
    { route_type: "wire", x: -44, y: -8, layer: "top", width: 0.5 },
    {
      route_type: "via",
      x: -44,
      y: -8,
      from_layer: "top",
      to_layer: "bottom",
      hole_diameter: 2,
      outer_diameter: 4,
    },
    { route_type: "wire", x: -44, y: -8, layer: "bottom", width: 0.5 },
    { route_type: "wire", x: -39, y: -8, layer: "bottom", width: 0.5 },
  ] satisfies PcbTrace["route"]

  const exposedRoute = [
    { route_type: "wire", x: -27, y: -8, layer: "top", width: 0.5 },
    { route_type: "wire", x: -22, y: -8, layer: "top", width: 0.5 },
    {
      route_type: "via",
      x: -22,
      y: -8,
      from_layer: "top",
      to_layer: "bottom",
      hole_diameter: 2,
      outer_diameter: 4,
      tented_on_top: false,
      tented_on_bottom: false,
    },
    { route_type: "wire", x: -22, y: -8, layer: "bottom", width: 0.5 },
    { route_type: "wire", x: -17, y: -8, layer: "bottom", width: 0.5 },
  ] satisfies PcbTrace["route"]

  const topTentedRoute = [
    { route_type: "wire", x: -5, y: -8, layer: "top", width: 0.5 },
    { route_type: "wire", x: 0, y: -8, layer: "top", width: 0.5 },
    {
      route_type: "via",
      x: 0,
      y: -8,
      from_layer: "top",
      to_layer: "bottom",
      hole_diameter: 2,
      outer_diameter: 4,
      tented_on_top: true,
      tented_on_bottom: false,
    },
    { route_type: "wire", x: 0, y: -8, layer: "bottom", width: 0.5 },
    { route_type: "wire", x: 5, y: -8, layer: "bottom", width: 0.5 },
  ] satisfies PcbTrace["route"]

  const bottomTentedRoute = [
    { route_type: "wire", x: 17, y: -8, layer: "top", width: 0.5 },
    { route_type: "wire", x: 22, y: -8, layer: "top", width: 0.5 },
    {
      route_type: "via",
      x: 22,
      y: -8,
      from_layer: "top",
      to_layer: "bottom",
      hole_diameter: 2,
      outer_diameter: 4,
      tented_on_top: false,
      tented_on_bottom: true,
    },
    { route_type: "wire", x: 22, y: -8, layer: "bottom", width: 0.5 },
    { route_type: "wire", x: 27, y: -8, layer: "bottom", width: 0.5 },
  ] satisfies PcbTrace["route"]

  const bothTentedRoute = [
    { route_type: "wire", x: 39, y: -8, layer: "top", width: 0.5 },
    { route_type: "wire", x: 44, y: -8, layer: "top", width: 0.5 },
    {
      route_type: "via",
      x: 44,
      y: -8,
      from_layer: "top",
      to_layer: "bottom",
      hole_diameter: 2,
      outer_diameter: 4,
      tented_on_top: true,
      tented_on_bottom: true,
    },
    { route_type: "wire", x: 44, y: -8, layer: "bottom", width: 0.5 },
    { route_type: "wire", x: 49, y: -8, layer: "bottom", width: 0.5 },
  ] satisfies PcbTrace["route"]

  circuit.add(
    <board
      width={116}
      height={80}
      thickness={1.6}
      defaultViaTenting="top_tented"
      routingDisabled
      schematicDisabled
    >
      <silkscreentext
        pcbY={35}
        layer="top"
        fontSize={1.2}
        text="TOP VIEW - GLB via tenting"
      />
      <silkscreentext
        pcbY={35}
        layer="bottom"
        fontSize={1.2}
        text="BOTTOM VIEW - GLB via tenting"
      />
      <silkscreentext
        pcbY={31}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="default_via_tented_on_top: true"
      />
      <silkscreentext
        pcbY={28.5}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="default_via_tented_on_bottom: false"
      />
      <silkscreentext
        pcbY={12.5}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="pcb_via + overlapping pcb_silkscreen_text"
      />

      {/* Inherited tenting: top covered, bottom exposed. */}
      <via
        name="INHERITED"
        pcbX={-44}
        pcbY={8}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={2}
        outerDiameter={4}
      />
      <pcbtrace route={inheritedRoute} />
      <silkscreentext
        pcbX={-44}
        pcbY={22}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="Inherit board defaults"
      />
      <silkscreentext
        pcbX={-44}
        pcbY={19}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_top: unset"
      />
      <silkscreentext
        pcbX={-44}
        pcbY={16.5}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_bottom: unset"
      />
      <silkscreentext
        pcbX={-44}
        pcbY={8}
        layers={["top", "bottom"]}
        fontSize={3.6}
        text="PB1"
      />

      {/* Explicit exposure overrides the board's top-tented default. */}
      <via
        name="EXPOSED"
        pcbX={-22}
        pcbY={8}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={2}
        outerDiameter={4}
        tented="exposed"
      />
      <pcbtrace route={exposedRoute} />
      <silkscreentext
        pcbX={-22}
        pcbY={22}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="Explicit exposure"
      />
      <silkscreentext
        pcbX={-22}
        pcbY={19}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_top: false"
      />
      <silkscreentext
        pcbX={-22}
        pcbY={16.5}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_bottom: false"
      />
      <silkscreentext
        pcbX={-22}
        pcbY={8}
        layers={["top", "bottom"]}
        fontSize={3.6}
        text="PB1"
      />

      {/* Explicit top-only tenting. */}
      <via
        name="TOP_TENTED"
        pcbX={0}
        pcbY={8}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={2}
        outerDiameter={4}
        tented="top_tented"
      />
      <pcbtrace route={topTentedRoute} />
      <silkscreentext
        pcbX={0}
        pcbY={22}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="Top tented"
      />
      <silkscreentext
        pcbX={0}
        pcbY={19}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_top: true"
      />
      <silkscreentext
        pcbX={0}
        pcbY={16.5}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_bottom: false"
      />
      <silkscreentext
        pcbX={0}
        pcbY={8}
        layers={["top", "bottom"]}
        fontSize={3.6}
        text="PB1"
      />

      {/* Explicit bottom-only tenting also removes the board's top tenting. */}
      <via
        name="BOTTOM_TENTED"
        pcbX={22}
        pcbY={8}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={2}
        outerDiameter={4}
        tented="bottom_tented"
      />
      <pcbtrace route={bottomTentedRoute} />
      <silkscreentext
        pcbX={22}
        pcbY={22}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="Bottom tented"
      />
      <silkscreentext
        pcbX={22}
        pcbY={19}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_top: false"
      />
      <silkscreentext
        pcbX={22}
        pcbY={16.5}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_bottom: true"
      />
      <silkscreentext
        pcbX={22}
        pcbY={8}
        layers={["top", "bottom"]}
        fontSize={3.6}
        text="PB1"
      />

      {/* Explicit tenting on both sides. */}
      <via
        name="BOTH_TENTED"
        pcbX={44}
        pcbY={8}
        fromLayer="top"
        toLayer="bottom"
        holeDiameter={2}
        outerDiameter={4}
        tented="top_and_bottom_tented"
      />
      <pcbtrace route={bothTentedRoute} />
      <silkscreentext
        pcbX={44}
        pcbY={22}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="Both tented"
      />
      <silkscreentext
        pcbX={44}
        pcbY={19}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_top: true"
      />
      <silkscreentext
        pcbX={44}
        pcbY={16.5}
        layers={["top", "bottom"]}
        fontSize={1.05}
        text="tented_on_bottom: true"
      />
      <silkscreentext
        pcbX={44}
        pcbY={8}
        layers={["top", "bottom"]}
        fontSize={3.6}
        text="PB1"
      />

      <silkscreentext
        pcbY={1}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="PB1 stays intact on tented sides; exposed openings interrupt it"
      />
      <silkscreentext
        pcbY={-3}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="pcb_trace.route vias"
      />

      {/* Control: fully tented, with no nearby pad opening. */}
      <via
        name="CONTROL"
        pcbX={-25}
        pcbY={-28}
        holeDiameter={2}
        outerDiameter={4}
        fromLayer="top"
        toLayer="bottom"
        tented="top_and_bottom_tented"
      />
      <silkscreentext
        pcbX={-25}
        pcbY={-18}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="pcb_via: no pad overlap"
      />
      <silkscreentext
        pcbX={-25}
        pcbY={-21}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="tented_on_top: true"
      />
      <silkscreentext
        pcbX={-25}
        pcbY={-23.5}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="tented_on_bottom: true"
      />
      <silkscreentext
        pcbX={-25}
        pcbY={-34}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="Fully tented"
      />

      {/* Pad openings must remain exposed even where they overlap a tented via. */}
      <via
        name="PAD_OVERLAP"
        pcbX={29.4}
        pcbY={-28}
        holeDiameter={2}
        outerDiameter={4}
        fromLayer="top"
        toLayer="bottom"
        tented="top_and_bottom_tented"
      />
      <smtpad
        pcbX={25}
        pcbY={-28}
        layer="top"
        shape="rect"
        width={8}
        height={4.8}
        portHints={["overlap_top"]}
      />
      <smtpad
        pcbX={25}
        pcbY={-28}
        layer="bottom"
        shape="rect"
        width={8}
        height={4.8}
        portHints={["overlap_bottom"]}
      />
      <silkscreentext
        pcbX={25}
        pcbY={-18}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="pcb_smtpad + pcb_via"
      />
      <silkscreentext
        pcbX={25}
        pcbY={-21}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="tented_on_top: true"
      />
      <silkscreentext
        pcbX={25}
        pcbY={-23.5}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="tented_on_bottom: true"
      />
      <silkscreentext
        pcbX={25}
        pcbY={-34}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="Pad opening stays exposed"
      />
      <silkscreentext
        pcbX={25}
        pcbY={-36.5}
        layers={["top", "bottom"]}
        fontSize={1.2}
        text="Tenting ends at pad edge"
      />
    </board>,
  )
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
}, 30_000)
