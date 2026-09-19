import type { CadComponent, CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import type { ConversionOptions, Point3 } from "../../lib/types"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"

export const footprinterRotationCases = [
  { name: "zero", rotation: { x: 0, y: 0, z: 0 } },
  { name: "z47", rotation: { x: 0, y: 0, z: 47 } },
  { name: "bottom-y180-z-negative", rotation: { x: 0, y: 180, z: -47 } },
  { name: "x30", rotation: { x: 30, y: 0, z: 0 } },
  { name: "y30", rotation: { x: 0, y: 30, z: 0 } },
  { name: "xyz23-31-47", rotation: { x: 23, y: 31, z: 47 } },
  { name: "x-negative30", rotation: { x: -30, y: 0, z: 0 } },
]

export function footprinterCircuit(
  rotation: Point3,
  overrides: Partial<CadComponent> = {},
): CircuitJson {
  return [
    {
      type: "cad_component",
      cad_component_id: "cad-soic",
      pcb_component_id: "pcb-soic",
      source_component_id: "source-soic",
      footprinter_string: "soic8",
      position: { x: 7, y: -4, z: 3 },
      rotation,
      anchor_alignment: "center",
      model_object_fit: "contain_within_bounds",
      model_origin_position: { x: 0, y: 0, z: 0 },
      // No size: native mm geometry, not a fit-to-bounds experiment.
      ...overrides,
    },
  ]
}

export async function exportFootprinter(
  circuit: CircuitJson,
  options: ConversionOptions = {},
) {
  const glb = await convertCircuitJsonToGltf(circuit, {
    format: "glb",
    boardTextureResolution: 0,
    ...options,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary GLB")
  return {
    glb,
    mesh: parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY),
  }
}
