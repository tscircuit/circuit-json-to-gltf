import { test, expect } from "bun:test"
import { NodeIO } from "@gltf-transform/core"
import { convertCircuitJsonToGltf, convertCircuitJsonTo3D } from "../../lib"
import simpleCircuit from "../fixtures/simple-circuit.json"

const TEST_TRIANGLE_GLB_BASE64 =
  "Z2xURgIAAABEAwAA2AIAAEpTT057ImFzc2V0Ijp7ImdlbmVyYXRvciI6ImdsVEYtVHJhbnNmb3JtIHY0LjIuMSIsInZlcnNpb24iOiIyLjAifSwiYWNjZXNzb3JzIjpbeyJ0eXBlIjoiVkVDMyIsImNvbXBvbmVudFR5cGUiOjUxMjYsImNvdW50IjozLCJtYXgiOlsxLDEsMF0sIm1pbiI6WzAsMCwwXSwiYnVmZmVyVmlldyI6MCwiYnl0ZU9mZnNldCI6MH0seyJ0eXBlIjoiVkVDMyIsImNvbXBvbmVudFR5cGUiOjUxMjYsImNvdW50IjozLCJidWZmZXJWaWV3IjowLCJieXRlT2Zmc2V0IjoxMn0seyJ0eXBlIjoiU0NBTEFSIiwiY29tcG9uZW50VHlwZSI6NTEyMywiY291bnQiOjMsImJ1ZmZlclZpZXciOjEsImJ5dGVPZmZzZXQiOjB9XSwiYnVmZmVyVmlld3MiOlt7ImJ1ZmZlciI6MCwiYnl0ZU9mZnNldCI6MCwiYnl0ZUxlbmd0aCI6NzIsImJ5dGVTdHJpZGUiOjI0LCJ0YXJnZXQiOjM0OTYyfSx7ImJ1ZmZlciI6MCwiYnl0ZU9mZnNldCI6NzIsImJ5dGVMZW5ndGgiOjgsInRhcmdldCI6MzQ5NjN9XSwiYnVmZmVycyI6W3sibmFtZSI6IkJ1ZmZlciIsImJ5dGVMZW5ndGgiOjgwfV0sIm1lc2hlcyI6W3sibmFtZSI6Ik1lc2giLCJwcmltaXRpdmVzIjpbeyJhdHRyaWJ1dGVzIjp7IlBPU0lUSU9OIjowLCJOT1JNQUwiOjF9LCJtb2RlIjo0LCJpbmRpY2VzIjoyfV19XSwibm9kZXMiOlt7Im5hbWUiOiJUcmlhbmdsZSIsIm1lc2giOjB9XSwic2NlbmVzIjpbeyJuYW1lIjoiU2NlbmUiLCJub2RlcyI6WzBdfV0sInNjZW5lIjowfVAAAABCSU4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIA/AACAPwAAAAAAAAAAAAAAAAAAAAAAAIA/AAAAAAAAgD8AAAAAAAAAAAAAAAAAAIA/AAABAAIAAAA="

const TEST_TRIANGLE_DATA_URI = `data:application/octet-stream;base64,${TEST_TRIANGLE_GLB_BASE64}`

const TEST_TRIANGLE_GLTF_BASE64 =
  "eyJhc3NldCI6eyJ2ZXJzaW9uIjoiMi4wIn0sImJ1ZmZlcnMiOlt7ImJ5dGVMZW5ndGgiOjM2LCJ1cmkiOiJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsQUFBQUFBQUFBQUFBQUFBQUFBQ0FQd0FBQUFBQUFBQUFBQUFBQUFBQWdEOEFBQUFBIn1dLCJidWZmZXJWaWV3cyI6W3siYnVmZmVyIjowLCJieXRlT2Zmc2V0IjowLCJieXRlTGVuZ3RoIjozNiwidGFyZ2V0IjozNDk2Mn1dLCJhY2Nlc3NvcnMiOlt7ImJ1ZmZlclZpZXciOjAsImNvbXBvbmVudFR5cGUiOjUxMjYsImNvdW50IjozLCJ0eXBlIjoiVkVDMyIsIm1heCI6WzEsMSwwXSwibWluIjpbMCwwLDBdfV0sIm1lc2hlcyI6W3sicHJpbWl0aXZlcyI6W3siYXR0cmlidXRlcyI6eyJQT1NJVElPTiI6MH0sIm1vZGUiOjR9XX1dLCJub2RlcyI6W3sibmFtZSI6IlRyaWFuZ2xlIiwibWVzaCI6MH1dLCJzY2VuZXMiOlt7Im5vZGVzIjpbMF19XSwic2NlbmUiOjB9"

const TEST_TRIANGLE_GLTF_DATA_URI = `data:application/json;base64,${TEST_TRIANGLE_GLTF_BASE64}`

function createCircuitWithExternalModels() {
  const circuit = JSON.parse(JSON.stringify(simpleCircuit)) as any[]
  circuit.push(
    {
      type: "cad_component",
      cad_component_id: "cad1",
      pcb_component_id: "comp1",
      model_gltf_url: TEST_TRIANGLE_DATA_URI,
    },
    {
      type: "cad_component",
      cad_component_id: "cad2",
      pcb_component_id: "comp2",
      model_gltf_url: TEST_TRIANGLE_GLTF_DATA_URI,
      rotation: { x: 0, y: 0, z: 90 },
    },
  )

  return circuit
}

test("convertCircuitJsonToGltf should convert circuit to GLTF", async () => {
  const result = await convertCircuitJsonToGltf(simpleCircuit as any, {
    boardTextureResolution: 0,
  })

  // GLTF format returns an object
  expect(result).toBeDefined()
  expect(typeof result).toBe("object")

  // Check for GLTF structure
  const gltf = result as any
  expect(gltf.asset).toBeDefined()
  expect(gltf.asset.version).toBe("2.0")
  expect(gltf.scenes).toBeDefined()
  expect(gltf.nodes).toBeDefined()
  expect(gltf.meshes).toBeDefined()
  expect(gltf.buffers).toBeDefined()
  expect(gltf.bufferViews).toBeDefined()
  expect(gltf.accessors).toBeDefined()
})

test("convertCircuitJsonToGltf should convert circuit to GLB", async () => {
  const result = await convertCircuitJsonToGltf(simpleCircuit as any, {
    format: "glb",
    boardTextureResolution: 0,
  })

  // GLB format returns an ArrayBuffer
  expect(result).toBeInstanceOf(ArrayBuffer)
  expect((result as ArrayBuffer).byteLength).toBeGreaterThan(0)
})

test("convertCircuitJsonToGltf merges external GLTF components", async () => {
  const circuit = createCircuitWithExternalModels()
  const result = await convertCircuitJsonToGltf(circuit as any, {
    boardTextureResolution: 0,
  })

  expect(result).toBeDefined()
  expect(typeof result).toBe("object")

  const gltf = result as any
  const externalNodes = (gltf.nodes ?? []).filter(
    (node: any) =>
      typeof node.name === "string" && node.name.startsWith("comp"),
  )

  expect(externalNodes.length).toBe(2)
  expect(externalNodes[0]?.translation?.[0]).toBeCloseTo(-10)
  expect(externalNodes[0]?.translation?.[1]).toBeCloseTo(1.8)
  expect(externalNodes[0]?.translation?.[2]).toBeCloseTo(0)
  const rotation = externalNodes[1]?.rotation
  expect(rotation).toBeDefined()
  const rotationValues = rotation ? Object.values(rotation) : []
  expect(rotationValues.length).toBe(4)
  expect((gltf.meshes ?? []).length).toBeGreaterThan(1)
})

test("convertCircuitJsonToGltf merges GLTF components into GLB output", async () => {
  const circuit = createCircuitWithExternalModels()
  const result = await convertCircuitJsonToGltf(circuit as any, {
    format: "glb",
    boardTextureResolution: 0,
  })

  expect(result).toBeInstanceOf(ArrayBuffer)

  const io = new NodeIO()
  const document = await io.readBinary(new Uint8Array(result as ArrayBuffer))
  const scene =
    document.getRoot().getDefaultScene() ?? document.getRoot().listScenes()[0]
  const externalNodes = scene
    ?.listChildren()
    .filter((node) => node.getName()?.startsWith("comp"))

  expect(externalNodes?.length).toBe(2)
})

test("convertCircuitJsonTo3D should create 3D scene", async () => {
  const scene = await convertCircuitJsonTo3D(simpleCircuit as any, {
    renderBoardTextures: false,
  })

  expect(scene).toBeDefined()
  expect(scene.boxes).toBeInstanceOf(Array)
  expect(scene.boxes.length).toBeGreaterThan(0)

  // Should have the board box
  const boardBox = scene.boxes.find((box) => box.size.y === 1.6)
  expect(boardBox).toBeDefined()
  expect(boardBox?.center.x).toBe(0)
  expect(boardBox?.center.z).toBe(0)

  // Should have component boxes
  const componentBoxes = scene.boxes.filter((box) => box.label)
  expect(componentBoxes.length).toBe(2)

  // Check camera
  expect(scene.camera).toBeDefined()
  expect(scene.camera?.position).toBeDefined()

  // Check lights
  expect(scene.lights).toBeDefined()
  expect(scene.lights?.length).toBeGreaterThan(0)
})
