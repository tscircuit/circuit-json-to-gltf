import type { PcbHole, PcbVia } from "circuit-json"

/** Through-via drill positions in Circuit JSON +Z-up world XY, in mm.
 * These geometry-only holes reuse the substrate's existing round-drill path.
 * Partial layer spans must not become through-board holes.
 */
export const getThroughViaDrillHoles = (vias: PcbVia[]): PcbHole[] =>
  vias
    .filter(
      (via) => via.layers.includes("top") && via.layers.includes("bottom"),
    )
    .map((via) => ({
      type: "pcb_hole",
      pcb_hole_id: via.pcb_via_id,
      hole_shape: "circle",
      hole_diameter: via.hole_diameter,
      x: via.x,
      y: via.y,
    }))
