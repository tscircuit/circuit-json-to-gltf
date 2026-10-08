import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"

test("CAD color overrides authored JSCAD colors while preserving other material properties", async () => {
  const cad = {
    type: "cad_component" as const,
    cad_component_id: "cad_1",
    source_component_id: "source_1",
    position: { x: 0, y: 0, z: 0 },
    model_object_fit: "contain_within_bounds" as const,
    anchor_alignment: "center" as const,
    model_jscad: {
      type: "applyMaterial",
      material: { color: "red", metalness: 0.8, roughness: 0.2, opacity: 0.4 },
      shape: { type: "cuboid", size: [4, 4, 4] },
    },
  }
  for (const color of [undefined, "#00ff00"]) {
    const circuit: CircuitJson = [{ ...cad, color }]
    const result = (await convertCircuitJsonToGltf(circuit, {
      format: "glb",
    })) as ArrayBuffer
    const jsonLength = new DataView(result).getUint32(12, true)
    const gltf = JSON.parse(
      new TextDecoder().decode(new Uint8Array(result, 20, jsonLength)),
    )
    const material = gltf.materials[gltf.meshes[0].primitives[0].material]
    expect(material.pbrMetallicRoughness.baseColorFactor).toEqual(
      color ? [0, 1, 0, 0.4] : [1, 0, 0, 0.4],
    )
    expect(material.pbrMetallicRoughness.metallicFactor).toBe(0.8)
    expect(material.pbrMetallicRoughness.roughnessFactor).toBe(0.2)
  }
})
