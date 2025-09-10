import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf, convertCircuitJsonTo3D } from "../../lib"
import simpleCircuit from "../fixtures/simple-circuit.json"

test("convertCircuitJsonToGltf should convert circuit to GLTF", async () => {
  const result = await convertCircuitJsonToGltf(simpleCircuit as any, {
    boardTextureResolution: 512, // Lower resolution for testing
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
  })

  // GLB format returns an ArrayBuffer
  expect(result).toBeInstanceOf(ArrayBuffer)
  const arrayBuffer = result as ArrayBuffer
  expect(arrayBuffer.byteLength).toBeGreaterThan(0)

  // Parse JSON chunk to ensure buffer reference exists
  const view = new DataView(arrayBuffer)
  const jsonChunkLength = view.getUint32(12, true)
  const jsonBytes = new Uint8Array(arrayBuffer, 20, jsonChunkLength)
  const jsonText = new TextDecoder().decode(jsonBytes).replace(/\u0000+$/, "")
  const gltf = JSON.parse(jsonText)

  expect(Array.isArray(gltf.buffers)).toBe(true)
  expect(gltf.buffers.length).toBe(1)
  expect(gltf.buffers[0].byteLength).toBeGreaterThan(0)
})

test("convertCircuitJsonTo3D should create 3D scene", async () => {
  const scene = await convertCircuitJsonTo3D(simpleCircuit as any)

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
