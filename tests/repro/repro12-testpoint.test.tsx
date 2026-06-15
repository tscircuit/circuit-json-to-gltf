import { expect, test } from "bun:test"
import { renderGlbToPng } from "../helpers"
import { Circuit } from "tscircuit"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"

const Repro12Testpoint = () => (
  <board width="18mm" height="12mm">
    <testpoint name="T1" pcbX={-7} pcbY={3} padDiameter="0.8mm" />
    <testpoint name="T2" pcbX={7} pcbY={3} padDiameter="0.8mm" />
    <testpoint name="M1" pcbX={-7} pcbY={0} padDiameter="0.8mm" />
    <testpoint name="M2" pcbX={7} pcbY={0} padDiameter="0.8mm" />
    <testpoint name="B1" pcbX={-7} pcbY={-3} padDiameter="0.8mm" />
    <testpoint name="B2" pcbX={7} pcbY={-3} padDiameter="0.8mm" />
  </board>
)

export default Repro12Testpoint

test("repro12 testpoint 3d snapshot", async () => {
  const circuit = new Circuit()
  circuit.add(<Repro12Testpoint />)

  const circuitJson = await circuit.getCircuitJson()
  const scene = await convertCircuitJsonTo3D(circuitJson, {
    showBoundingBoxes: false,
    renderBoardTextures: true,
    textureResolution: 512,
  })

  expect(scene.boxes).toHaveLength(1)

  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })

  expect(glb).toBeInstanceOf(ArrayBuffer)
  expect((glb as ArrayBuffer).byteLength).toBeGreaterThan(0)

  expect(renderGlbToPng(glb as ArrayBuffer, circuitJson)).toMatchPngSnapshot(
    import.meta.path,
  )
})
