import { mat4, vec3 } from "gl-matrix"
import type { JscadOperation, Matrix4 } from "jscad-planner"
import { createMeshFromSTL, transformMesh } from "../gltf/geometry"
import { boundsOfPositions } from "../utils/bounding-box"
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
  targets: Box3D[],
): Box3D[] {
  return lines.flatMap((line) => {
    const target = targets.find(
      (box) => box.componentMetadata?.cad_component_id === line.targetRef,
    )
    // A printed part may author its whole shape away from the CAD origin.
    // Keep a valid origin, but clamp an origin outside the actual mesh bounds
    // onto the mesh's nearest bounding face so the guide reaches the part.
    // Match GLTFBuilder.addBox's rotation before its final X reflection.
    const bounds = target?.mesh
      ? boundsOfPositions(
          transformMesh(
            createMeshFromSTL(target.mesh),
            { x: 0, y: 0, z: 0 },
            target.rotation,
          ).positions,
        )
      : undefined
    const clampOrigin = (min: number, max: number) =>
      Math.max(min, Math.min(0, max))
    // Inverse of loadJscadPlan's CIRCUIT_Z_UP_TO_SCENE_Y_UP mapping.
    const offset = bounds
      ? {
          x: clampOrigin(bounds.min.x, bounds.max.x),
          y: clampOrigin(bounds.min.z, bounds.max.z),
          z: clampOrigin(bounds.min.y, bounds.max.y),
        }
      : { x: 0, y: 0, z: 0 }
    const dashes: JscadOperation[] = []
    const dashLength = 1
    const gapLength = 0.5
    const thickness = 0.3
    for (let i = 1; i < line.points.length; i++) {
      const a = line.points[i - 1]!
      const b = line.points[i]!
      const start = vec3.fromValues(
        a.x + offset.x,
        a.y + offset.y,
        a.z + offset.z,
      )
      const end = vec3.fromValues(
        b.x + offset.x,
        b.y + offset.y,
        b.z + offset.z,
      )
      const length = vec3.distance(start, end)
      if (!Number.isFinite(length))
        throw new Error("Explosion guide exceeds renderable coordinates")
      if (length < 1e-6) continue
      // Keep exported guide geometry bounded even for very long movements.
      const period = Math.max(dashLength + gapLength, length / 512)
      const direction = vec3.normalize(
        vec3.create(),
        vec3.subtract(vec3.create(), end, start),
      )
      const up = Math.abs(direction[2]) > 0.9 ? [0, 1, 0] : [0, 0, 1]
      for (
        let dash = 0;
        dash < Math.min(512, Math.ceil(length / period));
        dash++
      ) {
        const distance = dash * period
        const size = Math.min(
          (period * dashLength) / (dashLength + gapLength),
          length - distance,
        )
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
