import { expect, test } from "bun:test"
import { convertCircuitJsonToGltf, loadJscadPlan } from "../../lib"
import { convertSceneToGLTF } from "../../lib/converters/scene-to-gltf"

const materialPlan = {
  type: "applyMaterial",
  material: {
    color: "silver",
    metalness: 1,
    roughness: 0.2,
    opacity: 0.4,
    emissive: [0.1, 0.2, 0.3],
    emissiveIntensity: 2,
  },
  shape: {
    type: "translate",
    vector: [2, 3, 0],
    shape: {
      type: "subtract",
      shapes: [
        { type: "cuboid", size: [4, 4, 4] },
        { type: "cuboid", size: [2, 2, 6] },
      ],
    },
  },
}

function circuitForPlan(plan: unknown): any[] {
  return [
    {
      type: "cad_component",
      cad_component_id: "cad_1",
      source_component_id: "source_1",
      position: { x: 0, y: 0, z: 0 },
      rotation: { x: 0, y: 0, z: 0 },
      model_jscad: plan,
    },
  ]
}

test("authored material survives plan execution, Circuit JSON, and GLB export", async () => {
  const mesh = loadJscadPlan(materialPlan)
  expect(mesh.triangles.length).toBeGreaterThan(0)
  expect(
    mesh.triangles.every((triangle) => triangle.material?.metalness === 1),
  ).toBe(true)
  const glb = (await convertCircuitJsonToGltf(
    circuitForPlan(materialPlan) as any,
    { format: "glb" },
  )) as ArrayBuffer
  const jsonLength = new DataView(glb).getUint32(12, true)
  const gltf = JSON.parse(
    new TextDecoder().decode(new Uint8Array(glb, 20, jsonLength)),
  )
  const material = gltf.materials[gltf.meshes[0].primitives[0].material]
  expect(material.pbrMetallicRoughness.metallicFactor).toBe(1)
  expect(material.pbrMetallicRoughness.roughnessFactor).toBe(0.2)
  expect(material.pbrMetallicRoughness.baseColorFactor[0]).toBeCloseTo(0.527115)
  expect(material.pbrMetallicRoughness.baseColorFactor[3]).toBe(0.4)
  expect(material.alphaMode).toBe("BLEND")
  expect(material.emissiveFactor).toEqual([0.1, 0.2, 0.3])
  expect(
    material.extensions.KHR_materials_emissive_strength.emissiveStrength,
  ).toBe(2)
  expect(gltf.extensionsUsed).toContain("KHR_materials_emissive_strength")
})

test("geometry arrays keep separate material primitives, including unstyled geometry", async () => {
  const mesh = loadJscadPlan([
    materialPlan,
    { type: "cuboid", size: [1, 1, 1] },
    {
      type: "applyMaterial",
      material: {
        color: 0xff0000,
        metalness: 0,
        roughness: 1,
        opacity: 0.2,
        transparent: false,
      },
      shape: { type: "cuboid", size: [2, 2, 2] },
    },
  ])
  const gltf = (await convertSceneToGLTF({
    boxes: [{ center: { x: 0, y: 0, z: 0 }, size: { x: 1, y: 1, z: 1 }, mesh }],
  })) as any
  expect(gltf.meshes[0].primitives).toHaveLength(3)
  const materials = gltf.meshes[0].primitives.map(
    (primitive: any) => gltf.materials[primitive.material],
  )
  expect(materials[2].pbrMetallicRoughness.baseColorFactor).toEqual([
    1, 0, 0, 0.2,
  ])
  expect(materials[2].pbrMetallicRoughness.metallicFactor).toBe(0)
  expect(materials[2].alphaMode).toBe("OPAQUE")
  expect(materials[1].pbrMetallicRoughness.baseColorFactor).toEqual([
    0.7, 0.7, 0.7, 1,
  ])
})

test("colorize plans retain their normalized RGB and alpha", () => {
  const mesh = loadJscadPlan({
    type: "colorize",
    color: [1, 0.25, 0, 0.5],
    shape: { type: "cuboid", size: [2, 2, 2] },
  })
  expect(mesh.triangles[0]!.material).toEqual({
    color: [1, 0.25, 0],
    opacity: 0.5,
  })
})

test.each([
  ["#f00", [1, 0, 0]],
  ["rgb(100%, 0%, 0%)", [1, 0, 0]],
  ["hsl(120, 100%, 50%)", [0, 1, 0]],
  [
    [0.2, 0.4, 0.6],
    [0.2, 0.4, 0.6],
  ],
] as const)(
  "material color %s exports linear glTF RGB",
  async (color, expected) => {
    const mesh = loadJscadPlan({
      type: "applyMaterial",
      material: { color },
      shape: { type: "cuboid", size: [2, 2, 2] },
    })
    const gltf = (await convertSceneToGLTF({
      boxes: [
        { center: { x: 0, y: 0, z: 0 }, size: { x: 2, y: 2, z: 2 }, mesh },
      ],
    })) as any
    const material = gltf.materials[gltf.meshes[0].primitives[0].material]
    expect(material.pbrMetallicRoughness.baseColorFactor.slice(0, 3)).toEqual(
      expected,
    )
  },
)

test("translucency keeps explicitly authored opacity", async () => {
  const mesh = loadJscadPlan(materialPlan)
  const gltf = (await convertSceneToGLTF({
    boxes: [
      {
        center: { x: 0, y: 0, z: 0 },
        size: { x: 4, y: 4, z: 4 },
        mesh,
        isTranslucent: true,
      },
    ],
  })) as any
  const material = gltf.materials[gltf.meshes[0].primitives[0].material]
  expect(material.pbrMetallicRoughness.baseColorFactor[3]).toBe(0.4)
})
