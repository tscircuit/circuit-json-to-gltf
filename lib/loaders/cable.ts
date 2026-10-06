import type { CadCable, Point3 } from "circuit-json"
import { parseCableString } from "@tscircuit/cableprinter"
import { createCableMeshes } from "jscad-electronics/cables"
import { vec3 } from "gl-matrix"
import type { Box3D, Triangle } from "../types"
import { boundsOfTriangles } from "../utils/bounding-box"
import {
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "../utils/coordinate-transform"
import { getBoundingBoxSize } from "../utils/mesh-scale"

/** Consume resolved circuit-world points in mm (+X right, +Y top, +Z above).
 * Like loadJscadPlan, remap the mesh into Scene3D's Y-up frame exactly once.
 * No routing or sag is generated here. The GLTF builder handles its own final
 * Scene3D -> glTF mapping and triangle winding, as for every other mesh.
 */
export function loadCable(cable: CadCable): Box3D[] {
  // Consume producer-resolved absolute pin 1 points. Project away the axial
  // mating-face -> wire-exit offset; this is a frame conversion, not footprint
  // inference. Both the points and the path are still circuit-world Z-up.
  const pin1Side = (
    position: Point3 | undefined,
    end: "from" | "to",
  ): [number, number, number] | undefined => {
    if (!position || cable.path.length < 2) return undefined
    const tip = end === "from" ? cable.path[0]! : cable.path.at(-1)!
    const next = end === "from" ? cable.path[1]! : cable.path.at(-2)!
    const axis = vec3.normalize(vec3.create(), [
      next.x - tip.x,
      next.y - tip.y,
      next.z - tip.z,
    ])
    const side = vec3.fromValues(
      position.x - tip.x,
      position.y - tip.y,
      position.z - tip.z,
    )
    vec3.scaleAndAdd(side, side, axis, -vec3.dot(side, axis))
    if (vec3.length(side) < 1e-6) return undefined
    vec3.normalize(side, side)
    return [side[0], side[1], side[2]]
  }
  const meshes = createCableMeshes({
    definition: parseCableString(cable.cableprinter_string),
    path: cable.path.map(({ x, y, z }) => [x, y, z]),
    // Orient in circuit Z-up before the paired mesh transform to scene Y-up.
    startPin1Side: pin1Side(cable.from_connector_pin1_position, "from"),
    endPin1Side: pin1Side(cable.to_connector_pin1_position, "to"),
  })
  return meshes.map((mesh): Box3D => {
    const circuitTriangles: Triangle[] = []
    for (let i = 0; i < mesh.indices.length; i += 3) {
      const vertices = mesh.indices.slice(i, i + 3).map((vertex) => ({
        x: mesh.positions[vertex * 3]!,
        y: mesh.positions[vertex * 3 + 1]!,
        z: mesh.positions[vertex * 3 + 2]!,
      })) as Triangle["vertices"]
      const [a, b, c] = vertices
      const normal = vec3.normalize(
        vec3.create(),
        vec3.cross(
          vec3.create(),
          [b.x - a.x, b.y - a.y, b.z - a.z],
          [c.x - a.x, c.y - a.y, c.z - a.z],
        ),
      )
      circuitTriangles.push({
        vertices,
        normal: { x: normal[0], y: normal[1], z: normal[2] },
      })
    }
    // Paired with loaders/jscad-plan.ts: JSCAD/cable meshes use circuit Z-up.
    const triangles = transformTriangles(
      circuitTriangles,
      COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP,
    )
    const meshData = { triangles, boundingBox: boundsOfTriangles(triangles) }
    return {
      center: { x: 0, y: 0, z: 0 },
      size: getBoundingBoxSize(meshData.boundingBox),
      mesh: meshData,
      color: [
        mesh.color[0] * 255,
        mesh.color[1] * 255,
        mesh.color[2] * 255,
        mesh.color[3],
      ],
      label: `${cable.name} / ${mesh.name}`,
    }
  })
}
