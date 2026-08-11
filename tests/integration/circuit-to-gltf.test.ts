import { expect, test } from "bun:test"
import { convertCircuitJsonTo3D, convertCircuitJsonToGltf } from "../../lib"
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

  expect(gltf.extensionsUsed).toContain("KHR_materials_clearcoat")
  const boardSurfaceMaterials = gltf.materials.filter(
    (material: any) =>
      material.name?.startsWith("TopMaterial") ||
      material.name?.startsWith("BottomMaterial"),
  )
  expect(boardSurfaceMaterials).toHaveLength(2)
  for (const material of boardSurfaceMaterials) {
    expect(material.normalTexture?.index).toBeNumber()
    expect(material.normalTexture?.scale).toBe(0.2)
    expect(
      material.pbrMetallicRoughness?.metallicRoughnessTexture?.index,
    ).toBeNumber()
    expect(material.extensions?.KHR_materials_clearcoat?.clearcoatFactor).toBe(
      0.08,
    )
    expect(
      material.extensions?.KHR_materials_clearcoat?.clearcoatRoughnessFactor,
    ).toBe(0.55)
  }
  expect(gltf.images).toHaveLength(6)
  expect(gltf.textures).toHaveLength(6)
})

test("flat board surface mode omits realistic PBR maps", async () => {
  const gltf = (await convertCircuitJsonToGltf(simpleCircuit as any, {
    boardTextureResolution: 64,
    boardSurfaceMode: "flat",
  })) as any

  const boardSurfaceMaterials = gltf.materials.filter(
    (material: any) =>
      material.name?.startsWith("TopMaterial") ||
      material.name?.startsWith("BottomMaterial"),
  )
  for (const material of boardSurfaceMaterials) {
    expect(material.normalTexture).toBeUndefined()
    expect(
      material.pbrMetallicRoughness?.metallicRoughnessTexture,
    ).toBeUndefined()
  }
  expect(gltf.images).toHaveLength(2)
})

test("convertCircuitJsonToGltf should convert circuit to GLB", async () => {
  const result = await convertCircuitJsonToGltf(simpleCircuit as any, {
    format: "glb",
  })

  // GLB format returns an ArrayBuffer
  expect(result).toBeInstanceOf(ArrayBuffer)
  expect((result as ArrayBuffer).byteLength).toBeGreaterThan(0)
})

test("custom board color derives textured board sides", async () => {
  const result = await convertCircuitJsonToGltf(simpleCircuit as any, {
    boardTextureResolution: 64,
    backgroundColor: "#aeb8c6",
  })

  const gltf = result as any
  const expectedSideColor = [150 / 255, 158 / 255, 170 / 255, 1]
  const hasExpectedSideMaterial = gltf.materials.some((material: any) =>
    material.pbrMetallicRoughness?.baseColorFactor?.every(
      (channel: number, index: number) =>
        Math.abs(channel - expectedSideColor[index]!) < 1e-6,
    ),
  )

  expect(hasExpectedSideMaterial).toBe(true)
})

test("pcb_board solder mask derives board colors unless explicitly overridden", async () => {
  const circuitWithBoardColors = simpleCircuit.map((element) =>
    element.type === "pcb_board"
      ? {
          ...element,
          solder_mask_color: "#aeb8c6",
          silkscreen_color: "#ffffff",
        }
      : element,
  )

  const derivedScene = await convertCircuitJsonTo3D(
    circuitWithBoardColors as any,
    { renderBoardTextures: false },
  )
  expect(derivedScene.boxes[0]?.color).toBe("#aeb8c6")
  expect(derivedScene.boxes[0]?.sideColor).toBe("#969eaa")

  const overriddenScene = await convertCircuitJsonTo3D(
    circuitWithBoardColors as any,
    {
      pcbColor: "#112233",
      boardSideColor: "#445566",
      renderBoardTextures: false,
    },
  )
  expect(overriddenScene.boxes[0]?.color).toBe("#112233")
  expect(overriddenScene.boxes[0]?.sideColor).toBe("#445566")
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
