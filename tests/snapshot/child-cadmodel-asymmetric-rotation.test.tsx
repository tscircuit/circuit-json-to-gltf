import { expect, test } from "bun:test"
import { Circuit } from "tscircuit"
import { convertCircuitJsonToGltf } from "../../lib"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { getBoundingBoxCenter } from "../../lib/utils/mesh-scale"
import {
  getKeyedModelTriangles,
  isKeyTriangle,
  KEYED_CAD_MODEL_ORIGIN,
  KEYED_CAD_MODEL_URL,
} from "../fixtures/keyed-cad-model"
import { renderGlbToPng } from "../renderGlbToPng"

test("child CAD keeps an off-axis key aligned on both layers across PCB rotations", async () => {
  // Board-space key centers after placement; no CAD Euler values are used as an oracle.
  const cos32 = Math.cos((32 * Math.PI) / 180)
  const sin32 = Math.sin((32 * Math.PI) / 180)
  const placements = [
    { rotation: 0, top: [1.5, 1], bottom: [-1.5, 1] },
    { rotation: 180, top: [-1.5, -1], bottom: [1.5, -1] },
    {
      rotation: 32,
      top: [1.5 * cos32 - sin32, 1.5 * sin32 + cos32],
      bottom: [-1.5 * cos32 - sin32, -1.5 * sin32 + cos32],
    },
  ] as const
  const measurements: {
    layer: "top" | "bottom"
    center: ReturnType<typeof getBoundingBoxCenter>
    boardPosition: readonly [number, number]
  }[] = []

  for (const layer of ["top", "bottom"] as const) {
    for (const placement of placements) {
      const circuit = new Circuit()
      circuit.add(
        <board width={8} height={10} thickness={1.6} routingDisabled>
          <chip
            name="U1"
            footprint="0402"
            layer={layer}
            pcbRotation={placement.rotation}
            pcbX={0}
            pcbY={0}
            cadModel={
              <cadmodel
                modelUrl={KEYED_CAD_MODEL_URL}
                modelOriginPosition={KEYED_CAD_MODEL_ORIGIN}
              />
            }
          />
          <silkscreentext
            text={`${layer} ${placement.rotation}deg`}
            pcbY={-4.2}
            fontSize={0.5}
            layer={layer}
          />
        </board>,
      )
      await circuit.renderUntilSettled()
      const circuitJson = await circuit.getCircuitJson()
      const glb = await convertCircuitJsonToGltf(circuitJson, {
        format: "glb",
        boardTextureResolution: 512,
      })
      if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary glTF")

      await expect(
        renderGlbToPng(
          glb,
          circuitJson,
          { width: 512, height: 512, up: "z+", ambient: 0.8 },
          {
            preset: layer === "top" ? "top_down" : "bottom_up",
            ortho: true,
            aspectRatio: 1,
          },
        ),
      ).toMatchPngSnapshot(
        import.meta.path,
        `child-cadmodel-asymmetric-${layer}-${placement.rotation}`,
      )

      const key = getKeyedModelTriangles(glb).filter(isKeyTriangle)
      expect(key).toHaveLength(12)
      measurements.push({
        layer,
        center: getBoundingBoxCenter(boundsOfTriangles(key)),
        boardPosition: placement[layer],
      })
    }
  }
  for (const { layer, center, boardPosition } of measurements) {
    const [boardX, boardY] = boardPosition
    expect(center.x).toBeCloseTo(-boardX, 5)
    expect(center.y).toBeCloseTo(layer === "top" ? 2.8 : -2.8, 5)
    expect(center.z).toBeCloseTo(boardY, 5)
  }
}, 30_000)
