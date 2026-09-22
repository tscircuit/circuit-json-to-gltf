import {
  createBoxMesh,
  createMeshFromSTL,
  transformMesh,
} from "../gltf/geometry"
import type { Box3D, Point3, Triangle } from "../types"
import { boundsOfTriangles } from "./bounding-box"
import { type PcbFold, swapPcbSceneAxes } from "./pcb-fold"

/** Rigidly carry a Scene3D box (+Y up, mm) with its board. The board center and
 * mount are Circuit JSON XY points. Existing format/layer rotations are baked
 * using geometry.transformMesh, exactly as GLTFBuilder.addBox does, before the
 * fold. No new Euler mapping or format-specific flip is introduced.
 */
export function foldRigidBox(
  box: Box3D,
  fold: PcbFold,
  boardCenter: { x: number; y: number },
  mount?: { x: number; y: number },
): Box3D {
  const source = box.mesh
    ? createMeshFromSTL(box.mesh)
    : createBoxMesh(box.size)
  const rotated = transformMesh(source, { x: 0, y: 0, z: 0 }, box.rotation)
  const center = {
    x: box.center.x - boardCenter.x,
    y: box.center.z - boardCenter.y,
    z: box.center.y,
  }
  const anchor = mount
    ? { x: mount.x - boardCenter.x, y: mount.y - boardCenter.y, z: 0 }
    : center
  const points: Point3[] = []
  for (let i = 0; i < rotated.positions.length; i += 3)
    points.push(
      swapPcbSceneAxes({
        x: rotated.positions[i]!,
        y: rotated.positions[i + 1]!,
        z: rotated.positions[i + 2]!,
      }),
    )
  fold.assertRigid(
    points.map((p) => ({
      x: p.x + center.x,
      y: p.y + center.y,
      z: p.z + center.z,
    })),
    box.label ?? "CAD component or stiffener",
  )
  const movedCenter = fold.point(center, anchor)
  const triangles: Triangle[] = []
  for (let i = 0; i < rotated.indices.length; i += 3) {
    // Undo createMeshFromSTL's export winding swap; GLTFBuilder applies it once later.
    const indices = [
      rotated.indices[i]!,
      rotated.indices[i + 2]!,
      rotated.indices[i + 1]!,
    ]
    const vertices = indices.map((index) =>
      swapPcbSceneAxes(fold.direction(points[index]!, anchor)),
    ) as Triangle["vertices"]
    const j = indices[0]! * 3
    const normal = swapPcbSceneAxes(
      fold.direction(
        swapPcbSceneAxes({
          x: rotated.normals[j]!,
          y: rotated.normals[j + 1]!,
          z: rotated.normals[j + 2]!,
        }),
        anchor,
      ),
    )
    triangles.push({ ...box.mesh?.triangles[i / 3], vertices, normal })
  }
  const boundingBox = boundsOfTriangles(triangles)
  return {
    ...box,
    size: {
      x: boundingBox.max.x - boundingBox.min.x,
      y: boundingBox.max.y - boundingBox.min.y,
      z: boundingBox.max.z - boundingBox.min.z,
    },
    center: {
      x: movedCenter.x + boardCenter.x,
      y: movedCenter.z,
      z: movedCenter.y + boardCenter.y,
    },
    rotation: undefined,
    mesh: { ...box.mesh, triangles, boundingBox },
  }
}
