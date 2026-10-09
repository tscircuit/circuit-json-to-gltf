import { glyphAdvanceRatio, glyphLineAlphabet } from "@tscircuit/alphabet"
import type { CadReferenceSurface } from "circuit-json"
import { mat4, vec3 } from "gl-matrix"
import type { JscadOperation, Matrix4 } from "jscad-planner"
import { loadJscadPlan } from "../loaders/jscad-plan"
import type { Box3D, Triangle } from "../types"
import { boundsOfTriangles } from "../utils/bounding-box"
import {
  COORDINATE_TRANSFORMS,
  transformTriangles,
} from "../utils/coordinate-transform"
import { getBoundingBoxSize } from "../utils/mesh-scale"

/** Diagnostic geometry from right-handed circuit-world frames (+X right,
 * +Y top, +Z up, mm). Centers are points; normal/X axes are directions.
 * Matches loadJscadPlan's circuit -> Scene3D (+Y up) boundary; glTF export
 * applies its canonical X mirror to this mesh alongside all CAD meshes.
 */
export function createReferenceSurfaceBox(
  surface: CadReferenceSurface,
  ownerName: string,
): Box3D {
  const width = surface.width ?? 10
  const height = surface.height ?? 10
  const center = vec3.fromValues(
    surface.center.x,
    surface.center.y,
    surface.center.z,
  )
  const normal = vec3.fromValues(
    surface.normal.x,
    surface.normal.y,
    surface.normal.z,
  )
  const xAxis = vec3.fromValues(
    surface.x_axis.x,
    surface.x_axis.y,
    surface.x_axis.z,
  )
  const yAxis = vec3.cross(vec3.create(), normal, xAxis)
  const point = (x: number, y: number, z = 0) => {
    const result = vec3.clone(center)
    vec3.scaleAndAdd(result, result, xAxis, x)
    vec3.scaleAndAdd(result, result, yAxis, y)
    vec3.scaleAndAdd(result, result, normal, z)
    return { x: result[0], y: result[1], z: result[2] }
  }
  const corners = [
    point(-width / 2, -height / 2),
    point(width / 2, -height / 2),
    point(width / 2, height / 2),
    point(-width / 2, height / 2),
  ]
  const triangles: Triangle[] = [
    {
      vertices: [corners[0]!, corners[1]!, corners[2]!],
      normal: surface.normal,
      material: { color: [0.1, 0.75, 0.95], opacity: 0.2, transparent: true },
    },
    {
      vertices: [corners[0]!, corners[2]!, corners[3]!],
      normal: surface.normal,
      material: { color: [0.1, 0.75, 0.95], opacity: 0.2, transparent: true },
    },
  ]
  const strokes: JscadOperation[] = []
  const thickness = Math.min(width, height) * 0.018
  const line = (
    a: ReturnType<typeof point>,
    b: ReturnType<typeof point>,
    color: [number, number, number],
  ) => {
    const start = vec3.fromValues(a.x, a.y, a.z)
    const end = vec3.fromValues(b.x, b.y, b.z)
    const midpoint = vec3.lerp(vec3.create(), start, end, 0.5)
    const direction = vec3.normalize(
      vec3.create(),
      vec3.subtract(vec3.create(), end, start),
    )
    // targetTo's local Z follows the segment. Choose a nonparallel up axis.
    const up = Math.abs(direction[2]) > 0.9 ? [0, 1, 0] : [0, 0, 1]
    const matrix = mat4.targetTo(mat4.create(), midpoint, end, up)
    strokes.push({
      type: "applyMaterial",
      material: { color },
      shape: {
        type: "transform",
        matrix: Array.from(matrix) as Matrix4,
        shape: {
          type: "cuboid",
          size: [thickness, thickness, vec3.distance(start, end)],
        },
      },
    })
  }
  const cyan: [number, number, number] = [0.03, 0.55, 0.75]
  for (let i = 0; i < 4; i++) line(corners[i]!, corners[(i + 1) % 4]!, cyan)
  const arrowLength = Math.min(width, height) * 0.45
  const orange: [number, number, number] = [1, 0.35, 0.05]
  line(point(0, 0), point(0, 0, arrowLength), orange)
  line(
    point(0, 0, arrowLength),
    point(thickness * 4, 0, arrowLength * 0.75),
    orange,
  )
  line(
    point(0, 0, arrowLength),
    point(-thickness * 4, 0, arrowLength * 0.75),
    orange,
  )
  const label = `${ownerName}.${surface.name}`
  const fontSize = Math.min(width, height) * 0.14
  let cursor = -width / 2
  for (const character of label.toUpperCase()) {
    const glyph = glyphLineAlphabet[character as keyof typeof glyphLineAlphabet]
    for (const stroke of glyph ?? []) {
      line(
        point(
          cursor + stroke.x1 * fontSize,
          height / 2 + fontSize * stroke.y1 + fontSize * 0.3,
          thickness,
        ),
        point(
          cursor + stroke.x2 * fontSize,
          height / 2 + fontSize * stroke.y2 + fontSize * 0.3,
          thickness,
        ),
        cyan,
      )
    }
    cursor +=
      (glyphAdvanceRatio[character as keyof typeof glyphAdvanceRatio] ?? 0.65) *
      fontSize
  }
  const sceneTriangles = [
    ...transformTriangles(
      triangles,
      COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP,
    ),
    ...loadJscadPlan(strokes).triangles,
  ]
  const boundingBox = boundsOfTriangles(sceneTriangles)
  // Keep the mesh local to its measured center, like other CAD boxes, so
  // camera fitting and mesh export use the same world placement.
  const meshCenter = {
    x: (boundingBox.min.x + boundingBox.max.x) / 2,
    y: (boundingBox.min.y + boundingBox.max.y) / 2,
    z: (boundingBox.min.z + boundingBox.max.z) / 2,
  }
  for (const triangle of sceneTriangles) {
    triangle.vertices = triangle.vertices.map((vertex) => ({
      x: vertex.x - meshCenter.x,
      y: vertex.y - meshCenter.y,
      z: vertex.z - meshCenter.z,
    })) as Triangle["vertices"]
  }
  return {
    center: meshCenter,
    size: getBoundingBoxSize(boundingBox),
    label,
    mesh: {
      triangles: sceneTriangles,
      boundingBox: boundsOfTriangles(sceneTriangles),
    },
  }
}
