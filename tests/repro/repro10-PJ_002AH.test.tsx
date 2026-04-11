import { Circuit } from "tscircuit"
import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import { getBestCameraPosition } from "../../lib/utils/camera-position"
import { renderGLTFToPNGBufferFromGLBBuffer } from "poppygl"
import type { ChipProps } from "@tscircuit/props"

const pinLabels = {
  pin1: ["pin1"],
  pin2: ["pin2"],
  pin3: ["pin3"],
} as const

export const PJ_002AH = (props: ChipProps<typeof pinLabels>) => {
  return (
    <chip
      pinLabels={pinLabels}
      supplierPartNumbers={{
        jlcpcb: ["C2961147"],
      }}
      manufacturerPartNumber="PJ_002AH"
      footprint={
        <footprint>
          <platedhole
            portHints={["pin3"]}
            pcbX="-0mm"
            pcbY="2.2750082mm"
            holeWidth="0.999998mm"
            holeHeight="3.1999936mm"
            outerWidth="1.7999964mm"
            outerHeight="3.999992mm"
            pcbRotation="90deg"
            shape="pill"
          />
          <platedhole
            portHints={["pin2"]}
            pcbX="2.999994mm"
            pcbY="-2.4250078mm"
            holeWidth="0.999998mm"
            holeHeight="3.1999936mm"
            outerWidth="1.7999964mm"
            outerHeight="3.999992mm"
            shape="pill"
          />
          <platedhole
            portHints={["pin1"]}
            pcbX="-2.999994mm"
            pcbY="-2.4250078mm"
            holeWidth="0.999998mm"
            holeHeight="3.499993mm"
            outerWidth="1.999996mm"
            outerHeight="4.499991mm"
            pcbRotation="180deg"
            shape="pill"
          />
          <silkscreenpath
            route={[
              { x: 7.199985599999991, y: 2.075008599999819 },
              { x: 7.199985599999991, y: -6.924973400000113 },
            ]}
          />
          <silkscreenpath
            route={[
              { x: -3.699992599999973, y: -4.687208000000055 },
              { x: -3.699992599999973, y: -6.924973400000113 },
              { x: 10.699978599999895, y: -6.924973400000113 },
              { x: 10.699978599999895, y: 2.0550187999999707 },
            ]}
          />
          <silkscreenpath
            route={[
              { x: -2.213279800000123, y: 2.075008599999819 },
              { x: -3.699992599999973, y: 2.075008599999819 },
              { x: -3.699992599999973, y: -0.16275680000001103 },
            ]}
          />
          <silkscreenpath
            route={[
              { x: 10.699978599999895, y: 2.075008599999819 },
              { x: 2.2132798000000093, y: 2.075008599999819 },
            ]}
          />
          <silkscreentext
            text="{NAME}"
            pcbX="3.51282mm"
            pcbY="3.4756682mm"
            anchorAlignment="center"
            fontSize="1mm"
          />
          <courtyardoutline
            outline={[
              { x: -4.039679999999976, y: 2.725668199999973 },
              { x: 11.065319999999929, y: 2.725668199999973 },
              { x: 11.065319999999929, y: -7.223131800000033 },
              { x: -4.039679999999976, y: -7.223131800000033 },
              { x: -4.039679999999976, y: 2.725668199999973 },
            ]}
          />
        </footprint>
      }
      {...props}
    />
  )
}

test("PJ_002AH glb snapshot", async () => {
  const circuit = new Circuit()
  circuit.add(
    <board width="20mm" height="20mm">
      <PJ_002AH name="U1" />
    </board>,
  )

  const circuitJson = await circuit.getCircuitJson()

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)

  expect(
    renderGLTFToPNGBufferFromGLBBuffer(
      glb as ArrayBuffer,
      getBestCameraPosition(circuitJson),
    ),
  ).toMatchPngSnapshot(import.meta.path)
}, 10_000)
