import { expect, test } from "bun:test"
import { Circuit } from "tscircuit"
import { convertCircuitJsonToGltf } from "../../lib"
import { boundsOfTriangles } from "../../lib/utils/bounding-box"
import { getBoundingBoxSize } from "../../lib/utils/mesh-scale"
import {
  getKeyedModelTriangles,
  KEYED_CAD_MODEL_ORIGIN,
  KEYED_CAD_MODEL_URL,
} from "../fixtures/keyed-cad-model"
import { renderGlbToPng } from "../renderGlbToPng"

test("child CAD size changes exported geometry for numeric and SI distances", async () => {
  const cases = [
    { name: "native", size: undefined, scale: 1 },
    { name: "half", size: { x: 3, y: 2, z: 1.5 }, scale: 0.5 },
    {
      name: "double",
      size: { x: "1.2cm", y: "8mm", z: "6000um" },
      scale: 2,
    },
  ]
  const measurements: {
    bounds: ReturnType<typeof boundsOfTriangles>
    scale: number
  }[] = []
  for (const { name, size, scale } of cases) {
    const circuit = new Circuit()
    circuit.add(
      <board width={16} height={12} thickness={1.6} routingDisabled>
        <chip
          name="U1"
          footprint="0402"
          pcbX={0}
          pcbY={0}
          cadModel={
            <cadmodel
              modelUrl={KEYED_CAD_MODEL_URL}
              modelOriginPosition={KEYED_CAD_MODEL_ORIGIN}
              size={size}
            />
          }
        />
        <silkscreentext
          text={`${name} ${6 * scale}x${4 * scale}x${3 * scale}mm`}
          pcbY={-5}
          fontSize={0.8}
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
      renderGlbToPng(glb, circuitJson, { width: 600, height: 500 }),
    ).toMatchPngSnapshot(import.meta.path, `child-cadmodel-size-${name}`)

    const part = getKeyedModelTriangles(glb)
    expect(part).toHaveLength(24)
    measurements.push({ bounds: boundsOfTriangles(part), scale })
  }
  for (const { bounds, scale } of measurements) {
    const measuredSize = getBoundingBoxSize(bounds)
    expect(measuredSize.x).toBeCloseTo(6 * scale, 5)
    expect(measuredSize.y).toBeCloseTo(3 * scale, 5)
    expect(measuredSize.z).toBeCloseTo(4 * scale, 5)
    expect(bounds.min.y).toBeCloseTo(0.8, 5)
  }
}, 30_000)
