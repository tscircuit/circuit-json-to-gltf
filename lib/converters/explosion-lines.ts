import { mat4, vec3 } from "gl-matrix"
import type { JscadOperation, Matrix4 } from "jscad-planner"
import { loadJscadPlan } from "../loaders/jscad-plan"
import type { AssemblyExplosionLine, Box3D } from "../types"
import { getBoundingBoxSize } from "../utils/mesh-scale"

/** Dashed motion paths in circuit-world XYZ, mm, +Z up. Points include world
 * translation. Like createReferenceSurfaceBox's strokes, loadJscadPlan maps
 * these to Scene3D +Y up and GLTFBuilder applies the same X reflection as CAD.
 * Use triangle geometry so guides survive GLB downloads and render in clients
 * that do not support glTF line primitives or renderer-specific overlays.
 */
export function createExplosionLineBoxes(
  lines: AssemblyExplosionLine[],
): Box3D[] {
  return lines.flatMap((line) => {
    const dashes: JscadOperation[] = []
    const dashLength = 1
    const gapLength = 0.5
    const thickness = 0.18
    for (let i = 1; i < line.points.length; i++) {
      const a = line.points[i - 1]!
      const b = line.points[i]!
      const start = vec3.fromValues(a.x, a.y, a.z)
      const end = vec3.fromValues(b.x, b.y, b.z)
      const length = vec3.distance(start, end)
      if (length < 1e-6) continue
      const direction = vec3.normalize(
        vec3.create(),
        vec3.subtract(vec3.create(), end, start),
      )
      const up = Math.abs(direction[2]) > 0.9 ? [0, 1, 0] : [0, 0, 1]
      for (
        let distance = 0;
        distance < length;
        distance += dashLength + gapLength
      ) {
        const size = Math.min(dashLength, length - distance)
        const midpoint = vec3.scaleAndAdd(
          vec3.create(),
          start,
          direction,
          distance + size / 2,
        )
        const target = vec3.add(vec3.create(), midpoint, direction)
        const matrix = mat4.targetTo(mat4.create(), midpoint, target, up)
        dashes.push({
          type: "transform",
          matrix: Array.from(matrix) as Matrix4,
          shape: { type: "cuboid", size: [thickness, thickness, size] },
        })
      }
    }
    if (!dashes.length) return []
    const mesh = loadJscadPlan(dashes)
    return [
      {
        center: { x: 0, y: 0, z: 0 },
        size: getBoundingBoxSize(mesh.boundingBox),
        color: "#6688aa",
        label: `Explosion guide: ${line.stageRef}/${line.targetRef}`,
        mesh,
      },
    ]
  })
}
