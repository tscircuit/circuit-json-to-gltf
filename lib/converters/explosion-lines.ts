import { createMeshFromSTL, transformMesh } from "../gltf/geometry"
import { boundsOfPositions } from "../utils/bounding-box"
import type { AssemblyExplosionLine, Box3D, SceneExplosionLine } from "../types"

/** Convert Circuit-world guide points (+Z up, mm) to Scene3D (+Y up, mm).
 * Match loadJscadPlan's Y/Z swap; GLTFBuilder applies the same final X
 * reflection as the geometry. Guides stay metadata, never physical meshes.
 */
export function createExplosionLines(
  lines: AssemblyExplosionLine[],
  targets: Box3D[],
): SceneExplosionLine[] {
  return lines.map((line) => {
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
    return {
      stageRef: line.stageRef,
      targetRef: line.targetRef,
      points: line.points.map((point) => ({
        x: point.x + offset.x,
        y: point.z + offset.z,
        z: point.y + offset.y,
      })),
    }
  })
}
