import { expect, test } from "bun:test"
import type { CircuitJson } from "circuit-json"
import { convertCircuitJsonToGltf } from "../../lib"
import { parseGLB } from "../../lib/loaders/glb"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import {
  getBoundingBoxCenter,
  getBoundingBoxSize,
} from "../../lib/utils/mesh-scale"

test.each(["real", "faux"] as const)(
  "%s board retains nonzero planar Y without changing its world height",
  async (kind) => {
    const circuit: CircuitJson = [
      {
        type: "pcb_component",
        pcb_component_id: "pcb1",
        source_component_id: "source1",
        center: { x: 3, y: -7 },
        width: 4,
        height: 6,
        rotation: 0,
        layer: "top",
        obstructs_within_bounds: true,
      },
    ]
    if (kind === "real") {
      circuit.push({
        type: "pcb_board",
        pcb_board_id: "board1",
        center: { x: 3, y: -7 },
        width: 10,
        height: 10,
        thickness: 1.6,
        num_layers: 2,
        material: "fr4",
      })
    }
    const glb = await convertCircuitJsonToGltf(circuit, {
      format: "glb",
      drawFauxBoard: true,
      boardTextureResolution: 0,
    })
    if (!(glb instanceof ArrayBuffer)) throw new Error("Expected GLB")
    const bounds = parseGLB(glb, COORDINATE_TRANSFORMS.IDENTITY).boundingBox
    const center = getBoundingBoxCenter(bounds)
    const size = getBoundingBoxSize(bounds)
    // Assertions observe final glTF coordinates, not an internal scene frame.
    expect(center.x).toBeCloseTo(-3, 6)
    expect(center.y).toBeCloseTo(0, 6)
    expect(center.z).toBeCloseTo(-7, 6)
    expect(size.x).toBeCloseTo(10, 6)
    expect(size.y).toBeCloseTo(1.6, 6)
    expect(size.z).toBeCloseTo(10, 6)
  },
)
