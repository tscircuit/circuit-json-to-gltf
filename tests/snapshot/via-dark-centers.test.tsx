import { expect, test } from "bun:test"
import { Resvg } from "@resvg/resvg-js"
import { Circuit } from "@tscircuit/core"
import type { PcbTrace } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderBoardTextures } from "../../lib/converters/board-renderer"
import { renderGlbToPng } from "../renderGlbToPng"

test("GLB textures shade tented via centers on the selected side", async () => {
  const route = [
    { route_type: "wire", x: -12, y: -3, layer: "top", width: 0.3 },
    { route_type: "wire", x: -9, y: -3, layer: "top", width: 0.3 },
    {
      route_type: "via",
      x: -9,
      y: -3,
      from_layer: "top",
      to_layer: "bottom",
      hole_diameter: 1,
      outer_diameter: 2,
      tented_on_top: true,
      tented_on_bottom: true,
    },
  ] satisfies PcbTrace["route"]
  const circuit = new Circuit()
  circuit.add(
    <board
      width={32}
      height={22}
      defaultViaTenting="top_tented"
      minViaHoleDiameter={1}
      minViaPadDiameter={2}
      routingDisabled
      schematicDisabled
    >
      <silkscreentext
        text="VIA DARK CENTERS"
        pcbY={9}
        fontSize={1}
        layers={["top", "bottom"]}
      />

      <silkscreentext
        text="INHERIT TOP"
        pcbX={-9}
        pcbY={6}
        fontSize={0.7}
        layers={["top", "bottom"]}
      />
      <via
        name="INHERITED"
        pcbX={-9}
        pcbY={3}
        holeDiameter={1}
        outerDiameter={2}
      />

      <silkscreentext
        text="EXPOSED"
        pcbX={0}
        pcbY={6}
        fontSize={0.7}
        layers={["top", "bottom"]}
      />
      <via
        name="EXPOSED"
        pcbX={0}
        pcbY={3}
        holeDiameter={1}
        outerDiameter={2}
        tented={false}
      />

      <silkscreentext
        text="BOTTOM ONLY"
        pcbX={9}
        pcbY={6}
        fontSize={0.7}
        layers={["top", "bottom"]}
      />
      <via
        name="BOTTOM"
        pcbX={9}
        pcbY={3}
        holeDiameter={1}
        outerDiameter={2}
        tented="bottom_tented"
      />

      <silkscreentext
        text="ROUTE VIA"
        pcbX={-9}
        pcbY={-6}
        fontSize={0.7}
        layers={["top", "bottom"]}
      />
      <pcbtrace route={route} />

      <silkscreentext
        text="PAD OPENING"
        pcbX={0}
        pcbY={-6}
        fontSize={0.7}
        layers={["top", "bottom"]}
      />
      <via
        name="PAD_OVERLAP"
        pcbX={0}
        pcbY={-3}
        holeDiameter={1}
        outerDiameter={2}
        tented
      />
      <smtpad
        shape="rect"
        pcbX={-0.6}
        pcbY={-3}
        width={1.2}
        height={2}
        layer="top"
      />
      <smtpad
        shape="rect"
        pcbX={-0.6}
        pcbY={-3}
        width={1.2}
        height={2}
        layer="bottom"
      />

      <silkscreentext
        text="BOTH SIDES"
        pcbX={9}
        pcbY={-6}
        fontSize={0.7}
        layers={["top", "bottom"]}
      />
      <via
        name="BOTH"
        pcbX={9}
        pcbY={-3}
        holeDiameter={1}
        outerDiameter={2}
        tented
      />
    </board>,
  )
  await circuit.renderUntilSettled()
  const circuitJson = circuit.getCircuitJson()

  const textures = await renderBoardTextures(circuitJson, { resolution: 1280 })
  function readTexture(texture: string) {
    const { pixels } = new Resvg(
      `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="880"><image href="${texture}" width="1280" height="880"/></svg>`,
    ).render()
    return (x: number, y: number) => {
      const offset =
        (Math.round((11 - y) * 40) * 1280 + Math.round((x + 16) * 40)) * 4
      return Array.from(pixels.subarray(offset, offset + 4))
    }
  }
  const topPixel = readTexture(textures.top)
  const bottomPixel = readTexture(textures.bottom)
  for (const pixel of [topPixel, bottomPixel]) {
    const center = pixel(9, -3)
    const ring = pixel(9.75, -3)
    for (let channel = 0; channel < 3; channel++) {
      expect(
        Math.abs(center[channel]! - ring[channel]! / 2),
      ).toBeLessThanOrEqual(1)
    }
    expect(pixel(-9, -3)).toEqual(center)
    expect(pixel(-8.25, -3)).toEqual(ring)
    expect(pixel(0.25, -3)).toEqual(center)
    expect(pixel(0.75, -3)).toEqual(ring)
    expect(pixel(-0.25, -3)).not.toEqual(center)
  }
  expect(topPixel(-9, 3)).toEqual(topPixel(9, -3))
  expect(bottomPixel(9, 3)).toEqual(bottomPixel(9, -3))
  expect(bottomPixel(-9, 3)).toEqual(bottomPixel(0, 3))
  expect(topPixel(9, 3)).toEqual(topPixel(0, 3))

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    includeModels: false,
    boardTextureResolution: 2048,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
  const renderOptions = {
    width: 1200,
    height: 900,
    supersampling: 2,
    ambient: 0.55,
    lightDir: [0, 1, 0],
    backgroundColor: [1, 1, 1],
  }
  // Same +Y-up glTF view as via-tenting.test.ts; PCB +Y maps to glTF +Z.
  const top = await renderGlbToPng(glb, circuitJson, renderOptions, {
    direction: [0, 1, -1e-3],
    ortho: true,
    aspectRatio: 4 / 3,
  })
  await expect(top).toMatchPngSnapshot(import.meta.path, "via-dark-centers-top")
  const bottom = await renderGlbToPng(
    glb,
    circuitJson,
    { ...renderOptions, lightDir: [0, -1, 0] },
    { preset: "bottom_up", ortho: true, aspectRatio: 4 / 3 },
  )
  await expect(bottom).toMatchPngSnapshot(
    import.meta.path,
    "via-dark-centers-bottom",
  )
}, 30_000)
