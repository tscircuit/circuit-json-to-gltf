import {
  PcbFoldError,
  tryFoldRigidMesh,
  type PcbFoldResult,
} from "@tscircuit/flex-utils"
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
  const result = tryFoldRigidBox(box, fold, boardCenter, mount)
  if (!result.ok) throw new PcbFoldError(result.issue)
  return result.value
}

/** Adapt Scene3D geometry to shared board-local rigid folding. Unsupported
 * rigid placements return an issue; mesh/model errors still propagate. */
export function tryFoldRigidBox(
  box: Box3D,
  fold: PcbFold,
  boardCenter: { x: number; y: number },
  mount?: { x: number; y: number },
): PcbFoldResult<Box3D> {
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
  const boardLocalTriangles: Triangle[] = []
  for (let i = 0; i < rotated.indices.length; i += 3) {
    // Undo createMeshFromSTL's export winding swap; GLTFBuilder applies it once later.
    const indices = [
      rotated.indices[i]!,
      rotated.indices[i + 2]!,
      rotated.indices[i + 1]!,
    ]
    const vertices = indices.map((index) => ({
      x: points[index]!.x + center.x,
      y: points[index]!.y + center.y,
      z: points[index]!.z + center.z,
    })) as Triangle["vertices"]
    const j = indices[0]! * 3
    const normal = swapPcbSceneAxes({
      x: rotated.normals[j]!,
      y: rotated.normals[j + 1]!,
      z: rotated.normals[j + 2]!,
    })
    boardLocalTriangles.push({
      ...box.mesh?.triangles[i / 3],
      vertices,
      normal,
    })
  }
  const result = tryFoldRigidMesh(
    {
      ...box.mesh,
      triangles: boardLocalTriangles,
      boundingBox: boundsOfTriangles(boardLocalTriangles),
    },
    fold,
    {
      flatAnchor: anchor,
      // Validate the PCB mount independently of an offset model's extents,
      // matching flex-utils' transformCadComponentPlacement.
      mount: anchor,
      label: box.label ?? "CAD component",
    },
  )
  if (!result.ok) return result
  const movedCenter = fold.point(center, anchor)
  // The shared mesh is absolute board-local +Z up. Restore model-local +Y up
  // around its moved center so GLTFBuilder still adds the translation once.
  const triangles: Triangle[] = result.value.triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map((p) =>
      swapPcbSceneAxes({
        x: p.x - movedCenter.x,
        y: p.y - movedCenter.y,
        z: p.z - movedCenter.z,
      }),
    ) as Triangle["vertices"],
    normal: swapPcbSceneAxes(triangle.normal),
  }))
  const boundingBox = boundsOfTriangles(triangles)
  return {
    ok: true,
    value: {
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
    },
  }
}
