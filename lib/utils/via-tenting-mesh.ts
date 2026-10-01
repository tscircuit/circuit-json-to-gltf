import type { PcbVia } from "circuit-json"
import type { BoundingBox, Point3, STLMesh, Triangle } from "../types"

/**
 * Surface films over through-via openings, separate from the drilled substrate.
 * Inputs are PCB world XY in mm; output matches createBoardMesh's +Y-up scene
 * frame: local X = PCB X - center.x, local Z = PCB Y - center.z.
 * The SVG-derived alpha texture determines coverage, including pad overlaps.
 */
export function createViaTentingMesh(
  vias: PcbVia[],
  center: Point3,
  bounds: BoundingBox,
  thickness: number,
): STLMesh {
  const triangles: Triangle[] = []
  const segments = 64
  for (const via of vias) {
    for (const side of [1, -1]) {
      if (!(side === 1 ? via.tented_on_top : via.tented_on_bottom)) continue
      const origin = {
        x: via.x - center.x,
        y: (side * thickness) / 2,
        z: via.y - center.z,
      }
      for (let i = 0; i < segments; i++) {
        const point = (step: number): Point3 => ({
          x:
            origin.x +
            (via.hole_diameter / 2) * Math.cos((step * 2 * Math.PI) / segments),
          y: origin.y,
          z:
            origin.z +
            (via.hole_diameter / 2) * Math.sin((step * 2 * Math.PI) / segments),
        })
        const vertices: Triangle["vertices"] =
          side === 1
            ? [origin, point(i + 1), point(i)]
            : [origin, point(i), point(i + 1)]
        triangles.push({
          vertices,
          normal: { x: 0, y: side, z: 0 },
          pcbFace: side === 1 ? "top" : "bottom",
          // Same flat UV convention as GLTFBuilder.addMeshWithFaceTextures.
          uvs: vertices.map((v) => ({
            u: (v.x - bounds.min.x) / (bounds.max.x - bounds.min.x),
            v: 1 - (v.z - bounds.min.z) / (bounds.max.z - bounds.min.z),
          })) as Triangle["uvs"],
        })
      }
    }
  }
  return { triangles, boundingBox: bounds }
}
