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
  expect((result as ArrayBuffer).byteLength).toBeGreaterThan(0)
})

test("custom board color applies to textured board sides", async () => {
  const result = await convertCircuitJsonToGltf(simpleCircuit as any, {
    boardTextureResolution: 64,
    backgroundColor: "#aeb8c6",
  })

  const gltf = result as any
  const expectedSideColor = [174 / 255, 184 / 255, 198 / 255, 1]
  const hasExpectedSideMaterial = gltf.materials.some((material: any) =>
    material.pbrMetallicRoughness?.baseColorFactor?.every(
      (channel: number, index: number) =>
        Math.abs(channel - expectedSideColor[index]!) < 1e-6,
    ),
  )

  expect(hasExpectedSideMaterial).toBe(true)
})

test("convertCircuitJsonTo3D should create 3D scene", async () => {
  const scene = await convertCircuitJsonTo3D(simpleCircuit as any, {
    showBoundingBoxes: true,
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
