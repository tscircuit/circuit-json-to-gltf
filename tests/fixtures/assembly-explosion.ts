import { any_circuit_element, type CircuitJson } from "circuit-json"

/** Mechanical CAD in right-handed circuit-world XYZ, mm, +Z up. */
export const assemblyExplosion: CircuitJson = [
  ...["base", "gold-bolt", "blue-bolt"].map((name, i) => ({
    type: "source_component" as const,
    source_component_id: `source_${i}`,
    ftype: "subassembly" as const,
    name,
  })),
  ...[0, 1, 2].map((i) => ({
    type: "cad_component" as const,
    cad_component_id: `cad_${i}`,
    source_component_id: `source_${i}`,
    position: { x: i === 1 ? 6 : i === 2 ? -6 : 0, y: i ? 7 : 0, z: i ? 2 : 0 },
    rotation: { x: 0, y: 0, z: 0 },
    model_origin_position: { x: 0, y: 0, z: 0 },
    color: ["#475569", "#f0b429", "#3283b5"][i],
    model_jscad:
      i === 0
        ? { type: "cuboid", size: [24, 24, 2], center: [0, 0, 0] }
        : {
            type: "union",
            shapes: [
              { type: "cylinder", radius: 1.5, height: 8, center: [0, 0, 4] },
              { type: "cylinder", radius: 3, height: 2, center: [0, 0, 9] },
            ],
          },
  })),
  {
    type: "cad_reference_surface",
    shape: "rect",
    cad_reference_surface_id: "face",
    source_component_id: "source_1",
    name: "bolt-face",
    center: { x: 6, y: 7, z: 2 },
    normal: { x: 0, y: 0, z: 1 },
    x_axis: { x: 1, y: 0, z: 0 },
    y_axis: { x: 0, y: 1, z: 0 },
  },
  {
    type: "cad_explosion_stage",
    cad_explosion_stage_id: "lift",
    name: "assembly.lift-bolts",
    order: 0,
    cad_component_ids: ["cad_1", "cad_2"],
    cad_reference_surface_ids: ["face"],
  },
  {
    type: "cad_explosion_stage",
    cad_explosion_stage_id: "park",
    name: "assembly.park-bolts",
    order: 1,
    cad_component_ids: ["cad_1", "cad_2"],
    cad_reference_surface_ids: ["face"],
  },
  {
    type: "cad_explosion_move",
    cad_explosion_move_id: "lift-gold",
    cad_explosion_stage_id: "lift",
    order: 0,
    targets: [
      { type: "cad_component", cad_component_id: "cad_1" },
      { type: "cad_reference_surface", cad_reference_surface_id: "face" },
    ],
    translation: { x: 0, y: 0, z: 10 },
  },
  {
    type: "cad_explosion_move",
    cad_explosion_move_id: "lift-blue",
    cad_explosion_stage_id: "lift",
    order: 1,
    targets: [{ type: "cad_component", cad_component_id: "cad_2" }],
    translation: { x: 0, y: 0, z: 16 },
  },
  {
    type: "cad_explosion_move",
    cad_explosion_move_id: "park-bolts",
    cad_explosion_stage_id: "park",
    order: 0,
    targets: [
      { type: "cad_explosion_stage", cad_explosion_stage_id: "lift" },
      { type: "cad_component", cad_component_id: "cad_1" },
    ],
    translation: { x: 20, y: 0, z: 0 },
  },
].map((record) => any_circuit_element.parse(record))
