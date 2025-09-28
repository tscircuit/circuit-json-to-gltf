import { expect, test } from "bun:test"
import { NodeIO } from "@gltf-transform/core"
import { convertCircuitJsonToGltf } from "../../lib"

type CircuitElement = Record<string, any>

const SIMPLE_TRIANGLE_GTLF_BASE64 =
  "ewogICJhc3NldCI6IHsgInZlcnNpb24iOiAiMi4wIiB9LAogICJidWZmZXJzIjogWwogICAgewogICAgICAiYnl0ZUxlbmd0aCI6IDM2LAogICAgICAidXJpIjogImRh" +
  "dGE6YXBwbGljYXRpb24vb2N0ZXQtc3RyZWFtO2Jhc2U2NCxBQUFBQUFBQUFBQUFBQUFBQUFDQVB3QUFBQUFBQUFBQUFBQUFBQUFBZ0Q4QUFBQUEiCiAgICB9CiAgXSwK" +
  "ICAiYnVmZmVyVmlld3MiOiBbCiAgICB7CiAgICAgICJidWZmZXIiOiAwLAogICAgICAiYnl0ZU9mZnNldCI6IDAsCiAgICAgICJieXRlTGVuZ3RoIjogMzYsCiAgICAg" +
  "ICJ0YXJnZXQiOiAzNDk2MgogICAgfQogIF0sCiAgImFjY2Vzc29ycyI6IFsKICAgIHsKICAgICAgImJ1ZmZlclZpZXciOiAwLAogICAgICAiY29tcG9uZW50VHlwZSI6" +
  "IDUxMjYsCiAgICAgICJjb3VudCI6IDMsCiAgICAgICJ0eXBlIjogIlZFQzMiLAogICAgICAibWF4IjogWzEsIDEsIDBdLAogICAgICAibWluIjogWzAsIDAsIDBdCiAg" +
  "ICB9CiAgXSwKICAibWVzaGVzIjogWwogICAgewogICAgICAicHJpbWl0aXZlcyI6IFsKICAgICAgICB7CiAgICAgICAgICAiYXR0cmlidXRlcyI6IHsgIlBPU0lUSU9O" +
  "IjogMCB9LAogICAgICAgICAgIm1vZGUiOiA0CiAgICAgICAgfQogICAgICBdCiAgICB9CiAgXSwKICAibm9kZXMiOiBbCiAgICB7CiAgICAgICJtZXNoIjogMAogICAg" +
  "fQogIF0sCiAgInNjZW5lcyI6IFsKICAgIHsKICAgICAgIm5vZGVzIjogWzBdCiAgICB9CiAgXSwKICAic2NlbmUiOiAwCn0K"

const SIMPLE_TRIANGLE_GTLF_DATA_URI = `data:application/json;base64,${SIMPLE_TRIANGLE_GTLF_BASE64}`

function createCircuit(modelUrl: string): CircuitElement[] {
  return [
    {
      type: "pcb_board",
      pcb_board_id: "board-gltf",
      center: { x: 0, y: 0 },
      width: 40,
      height: 20,
      thickness: 1.6,
    },
    {
      type: "pcb_component",
      pcb_component_id: "comp-gltf",
      source_component_id: "src-gltf",
      center: { x: 5, y: 3 },
      width: 5,
      height: 5,
      layer: "top",
    },
    {
      type: "source_component",
      source_component_id: "src-gltf",
      name: "GLTF", // used for fallback labels if needed
    },
    {
      type: "cad_component",
      cad_component_id: "cad-gltf",
      pcb_component_id: "comp-gltf",
      source_component_id: "src-gltf",
      size: { x: 4, y: 2, z: 4 },
      model_gltf_url: modelUrl,
    },
  ]
}

const EXPECTED_TRANSLATION = { x: 5, y: 1.8, z: 3 }

function expectTranslation(node: any, precision = 5) {
  expect(node.translation).toBeDefined()
  expect(node.translation[0]).toBeCloseTo(EXPECTED_TRANSLATION.x, precision)
  expect(node.translation[1]).toBeCloseTo(EXPECTED_TRANSLATION.y, precision)
  expect(node.translation[2]).toBeCloseTo(EXPECTED_TRANSLATION.z, precision)
}

test("combines external GLTF into JSON result", async () => {
  const circuit = createCircuit(SIMPLE_TRIANGLE_GTLF_DATA_URI)
  const result = await convertCircuitJsonToGltf(circuit as any, {
    boardTextureResolution: 0,
  })

  expect(result).toBeDefined()
  const gltf = result as any

  const wrapperNodeIndex = gltf.nodes.findIndex(
    (node: any) => node.name === "comp-gltf",
  )
  expect(wrapperNodeIndex).toBeGreaterThanOrEqual(0)

  const wrapperNode = gltf.nodes[wrapperNodeIndex]
  expect(wrapperNode.children?.length ?? 0).toBeGreaterThan(0)
  expectTranslation(wrapperNode)

  const defaultSceneIndex = gltf.scene ?? 0
  const defaultScene = gltf.scenes[defaultSceneIndex]
  expect(defaultScene.nodes).toContain(wrapperNodeIndex)
})

test("combines external GLTF into GLB output", async () => {
  const circuit = createCircuit(SIMPLE_TRIANGLE_GTLF_DATA_URI)
  const result = await convertCircuitJsonToGltf(circuit as any, {
    format: "glb",
    boardTextureResolution: 0,
  })

  expect(result).toBeInstanceOf(ArrayBuffer)
  const arrayBuffer = result as ArrayBuffer

  const io = new NodeIO()
  const document = await io.readBinary(new Uint8Array(arrayBuffer))
  const scene = document.getRoot().getDefaultScene()
  expect(scene).toBeDefined()

  const wrapperNode = scene
    ?.listChildren()
    .find((node) => node.getName() === "comp-gltf")
  expect(wrapperNode).toBeDefined()

  const translation = wrapperNode?.getTranslation() ?? [0, 0, 0]
  expect(translation[0]).toBeCloseTo(EXPECTED_TRANSLATION.x, 5)
  expect(translation[1]).toBeCloseTo(EXPECTED_TRANSLATION.y, 5)
  expect(translation[2]).toBeCloseTo(EXPECTED_TRANSLATION.z, 5)
})
