import { expect, test } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGLTFToPNGFromGLB } from "poppygl"

const plan = [
  { color: "silver", metalness: 1, roughness: 0.15 },
  { color: "#cc5533", metalness: 0, roughness: 0.9 },
  { color: "#3388ee", metalness: 0, roughness: 0.3, opacity: 0.4 },
].map((material, index) => ({
  type: "applyMaterial",
  material,
  shape: {
    type: "translate",
    vector: [(index - 1) * 5, 0, 0],
    shape: { type: "sphere", radius: 2, segments: 24 },
  },
}))

test("JSCAD materials render end to end through Circuit JSON and GLB in PoppyGL", async () => {
  const glb = (await convertCircuitJsonToGltf(
    [
      {
        type: "cad_component",
        cad_component_id: "cad_materials",
        source_component_id: "source_materials",
        position: { x: 0, y: 0, z: 0 },
        rotation: { x: 0, y: 0, z: 0 },
        model_jscad: plan,
      },
    ] as any,
    { format: "glb" },
  )) as ArrayBuffer
  await expect(
    renderGLTFToPNGFromGLB(glb, {
      width: 400,
      height: 200,
      realistic: true,
      supersampling: 1,
      backgroundColor: "#eeeeee",
      camPos: [0, 8, 22],
      lookAt: [0, 0, 0],
    }),
  ).toMatchPngSnapshot(import.meta.path)
})
