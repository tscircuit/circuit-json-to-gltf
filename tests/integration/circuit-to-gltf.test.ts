import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf, convertCircuitJsonTo3D } from "../../lib"
import simpleCircuit from "../fixtures/simple-circuit.json"

test("convertCircuitJsonTo3D should center board at (0,0,0) regardless of pcb_board.center", async () => {
  // Create a circuit with board center NOT at (0,0)
  const circuitJsonWithOffsetBoard = [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 25, y: 15 }, // Board center is at (25, 15), not (0,0)
      width: 50,
      height: 30,
      thickness: 1.6,
    },
    {
      type: "pcb_component",
      pcb_component_id: "comp1",
      source_component_id: "src1",
      center: { x: 15, y: 10 }, // Positioned relative to board center
      width: 8,
      height: 6,
      layer: "top",
    },
    {
      type: "source_component",
      source_component_id: "src1",
      name: "R1",
      display_value: "10k",
    },
  ]

  const scene = await convertCircuitJsonTo3D(circuitJsonWithOffsetBoard as any)

  expect(scene).toBeDefined()
  expect(scene.boxes).toBeInstanceOf(Array)
  expect(scene.boxes.length).toBeGreaterThan(0)

  // Board should be centered at (0,0,0) even though board.center is (25,15)
  const boardBox = scene.boxes.find((box) => box.size?.y === 1.6)
  expect(boardBox).toBeDefined()
  expect(boardBox?.center.x).toBe(0) // Should be 0, not 25
  expect(boardBox?.center.z).toBe(0) // Should be 0, not 15
})

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
