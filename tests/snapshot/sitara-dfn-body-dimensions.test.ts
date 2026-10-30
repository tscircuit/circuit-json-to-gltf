import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../../lib"

test("renders the compact Sitara DFN on its PCB land pattern", async () => {
  // SK-AM62 D4 (DIO_DFN0201_0-4), isolated on a small PCB so the
  // oversize body can be compared directly with the two copper lands.
  // Circuit JSON points use millimeters and +Z up.
  const circuitJson: CircuitJson = [
    {
      type: "pcb_board",
      pcb_board_id: "board",
      center: { x: 0, y: 0 },
      width: 8,
      height: 8,
      thickness: 1.6,
      num_layers: 2,
      material: "fr4",
    },
    {
      type: "pcb_component",
      pcb_component_id: "diode",
      source_component_id: "source_diode",
      center: { x: 0, y: 0 },
      width: 0.668528,
      height: 0.381,
      layer: "top",
      rotation: 0,
      obstructs_within_bounds: false,
    },
    {
      type: "cad_component",
      cad_component_id: "cad_diode",
      pcb_component_id: "diode",
      source_component_id: "source_diode",
      position: { x: 0, y: 0, z: 0.8 },
      rotation: { x: 0, y: 0, z: 0 },
      model_origin_alignment: "unknown",
      anchor_alignment: "center_of_component_on_board_surface",
      model_object_fit: "contain_within_bounds",
      footprinter_string:
        "dfn2_w0.65mm_h0.4mm_bodywidth0.65mm_bodylength0.4mm_p0.4mm",
    },
    ...[-1, 1].map((side): CircuitJson[number] => ({
      type: "pcb_smtpad",
      pcb_smtpad_id: `diode_pad_${side}`,
      pcb_component_id: "diode",
      shape: "rect",
      x: side * 0.219964,
      y: 0,
      width: 0.2286,
      height: 0.381,
      layer: "top",
      is_covered_with_solder_mask: false,
      soldermask_margin: 0.1016,
    })),
  ]
  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    boardTextureResolution: 512,
    includeModels: true,
    showBoundingBoxes: false,
  })
  if (!(glb instanceof ArrayBuffer)) throw new Error("Expected a GLB buffer")

  // glTF coordinates are millimeters with +Y up; use a fixed camera so
  // the same snapshot records the dimension change in the stacked fix.
  const png = await renderGLTFToPNGFromGLB(glb, {
    width: 900,
    height: 700,
    camPos: [7, 9, 10],
    lookAt: [0, 0.8, 0],
    fov: 36,
    backgroundColor: [1, 1, 1],
    grid: false,
  })
  await expect(png).toMatchPngSnapshot(import.meta.path)
})
