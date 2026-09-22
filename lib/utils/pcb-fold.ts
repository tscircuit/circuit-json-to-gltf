import type { Point3, STLMesh, Triangle } from "../types"
import { boundsOfTriangles } from "./bounding-box"

/** Temporary structural input matching circuit-json PR #816 until its release. */
export interface PcbBendRecord {
  type: "pcb_bend"
  pcb_bend_id: string
  pcb_board_id: string
  name?: string
  pcb_group_id?: string
  subcircuit_id?: string
  start: { x: number; y: number }
  end: { x: number; y: number }
  bend_angle: number
  bend_radius: number
  bend_side: "left" | "right"
}

interface Bend {
  id: string
  nx: number
  ny: number
  start: number
  end: number
  angle: number
  radius: number
  axisMin: number
  axisMax: number
}
const EPS = 1e-7

/** Points/directions in board-local Circuit JSON: +Z up, mm. */
export interface PcbFold {
  bends: Bend[]
  point(point: Point3, flatAnchor?: Point3): Point3
  direction(direction: Point3, flatAnchor: Point3): Point3
  assertRigid(points: Point3[], label: string): void
}

/** Parallel bends with the same moving direction form an ordered fold chain.
 * Input endpoints and returned transforms are board-local Circuit JSON (+Z up, mm).
 * Ordering comes from geometry, never from Circuit JSON array order.
 */
export function createPcbFold(
  records: PcbBendRecord[],
  thickness: number,
): PcbFold {
  const bends: Bend[] = records
    .map((b) => {
      const { start, end, bend_angle: degrees, bend_radius: radius } = b
      const values = [start?.x, start?.y, end?.x, end?.y, degrees, radius]
      if (
        values.some((v) => !Number.isFinite(v)) ||
        radius <= thickness / 2 ||
        !["left", "right"].includes(b.bend_side)
      ) {
        throw new Error(
          `Invalid PCB bend ${b.pcb_bend_id}: finite geometry and radius greater than half the board thickness are required`,
        )
      }
      const length = Math.hypot(end.x - start.x, end.y - start.y)
      if (length < EPS || Math.abs(degrees) > 180)
        throw new Error(
          `Unsupported PCB bend ${b.pcb_bend_id}: distinct endpoints and angles within ±180 degrees are required`,
        )
      const sign = b.bend_side === "right" ? 1 : -1
      const nx = (sign * (end.y - start.y)) / length
      const ny = (-sign * (end.x - start.x)) / length
      const angle = (degrees * Math.PI) / 180
      const width = radius * Math.abs(angle)
      const center = start.x * nx + start.y * ny
      return {
        id: b.pcb_bend_id,
        nx,
        ny,
        start: center - width / 2,
        end: center + width / 2,
        angle,
        radius,
        axisMin: Math.min(
          -ny * start.x + nx * start.y,
          -ny * end.x + nx * end.y,
        ),
        axisMax: Math.max(
          -ny * start.x + nx * start.y,
          -ny * end.x + nx * end.y,
        ),
      }
    })
    .filter((b) => Math.abs(b.angle) > EPS)
  const first = bends[0]
  if (
    first &&
    bends.some(
      (b) => Math.abs(b.nx - first.nx) > EPS || Math.abs(b.ny - first.ny) > EPS,
    )
  ) {
    throw new Error(
      "Folded PCB rendering currently requires parallel bends with the same moving direction",
    )
  }
  bends.sort((a, b) => a.start - b.start)
  for (let i = 1; i < bends.length; i++) {
    if (bends[i]!.start < bends[i - 1]!.end - EPS)
      throw new Error("Overlapping PCB bend zones are not supported")
  }
  const distalFirst = [...bends].reverse()
  const transform = (p: Point3, anchor: Point3, direction: boolean): Point3 => {
    let result = { ...p }
    // Fold distal regions first, then carry them with each proximal fold.
    for (const b of distalFirst) {
      const width = b.end - b.start
      const s = anchor.x * b.nx + anchor.y * b.ny - b.start
      const q = Math.max(0, Math.min(width, s))
      const theta = (b.angle * q) / width
      const cos = Math.cos(theta),
        sin = Math.sin(theta)
      const projected =
        result.x * b.nx + result.y * b.ny - (direction ? 0 : b.start)
      const tangentX = result.x - (projected + (direction ? 0 : b.start)) * b.nx
      const tangentY = result.y - (projected + (direction ? 0 : b.start)) * b.ny
      const signedRadius = Math.sign(b.angle) * b.radius
      const tx = direction ? 0 : signedRadius * sin - q * cos
      const tz = direction ? 0 : signedRadius * (1 - cos) - q * sin
      const folded = projected * cos - result.z * sin + tx
      result = {
        x: tangentX + (folded + (direction ? 0 : b.start)) * b.nx,
        y: tangentY + (folded + (direction ? 0 : b.start)) * b.ny,
        z: projected * sin + result.z * cos + tz,
      }
    }
    return result
  }
  return {
    bends,
    point: (p, anchor = p) => transform(p, anchor, false),
    direction: (p, anchor) => transform(p, anchor, true),
    assertRigid(points, label) {
      for (const b of bends) {
        const ds = points.map((p) => p.x * b.nx + p.y * b.ny)
        if (Math.max(...ds) > b.start + EPS && Math.min(...ds) < b.end - EPS)
          throw new Error(`${label} intersects PCB bend zone ${b.id}`)
      }
    },
  }
}

/** Scene3D local points/directions (+Y up, mm) <-> Circuit local (+Z up).
 * Matches COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP and
 * circuit-to-3d.ts's CAD center mapping; glTF's X mirror happens later.
 */
export const swapPcbSceneAxes = (p: Point3): Point3 => ({
  x: p.x,
  y: p.z,
  z: p.y,
})

/** Split planar triangles at bend tangencies and <=5 degree arc intervals before
 * deforming. Input/output mesh: board-local Scene3D (+Y up, mm). UVs and material
 * face identity remain attached to the flat surface rather than the folded normal.
 */
export function foldBoardMesh(mesh: STLMesh, fold: PcbFold): STLMesh {
  const planes = fold.bends.flatMap((b) => {
    const steps = Math.ceil(Math.abs(b.angle) / (Math.PI / 36))
    return Array.from({ length: steps + 1 }, (_, i) => ({
      b,
      d: b.start + ((b.end - b.start) * i) / steps,
    }))
  })
  const { min, max } = mesh.boundingBox
  type Vertex = { p: Point3; uv: { u: number; v: number } }
  const split = (
    polygon: Vertex[],
    nx: number,
    ny: number,
    d: number,
  ): Vertex[][] => {
    const distances = polygon.map(({ p }) => nx * p.x + ny * p.z - d)
    if (Math.min(...distances) >= -EPS || Math.max(...distances) <= EPS)
      return [polygon]
    const halves: Vertex[][] = [[], []]
    for (let side = 0; side < 2; side++) {
      const sign = side === 0 ? 1 : -1
      for (let i = 0; i < polygon.length; i++) {
        const a = polygon[i]!,
          next = (i + 1) % polygon.length,
          b = polygon[next]!
        const da = distances[i]! * sign,
          db = distances[next]! * sign
        if (da >= -EPS) halves[side]!.push(a)
        if ((da > EPS && db < -EPS) || (da < -EPS && db > EPS)) {
          const t = da / (da - db)
          halves[side]!.push({
            p: {
              x: a.p.x + (b.p.x - a.p.x) * t,
              y: a.p.y + (b.p.y - a.p.y) * t,
              z: a.p.z + (b.p.z - a.p.z) * t,
            },
            uv: {
              u: a.uv.u + (b.uv.u - a.uv.u) * t,
              v: a.uv.v + (b.uv.v - a.uv.v) * t,
            },
          })
        }
      }
    }
    return halves.filter((p) => p.length >= 3)
  }
  const triangles: Triangle[] = []
  for (const triangle of mesh.triangles) {
    const face =
      triangle.normal.y > 0.8
        ? "top"
        : triangle.normal.y < -0.8
          ? "bottom"
          : "side"
    let polygons: Vertex[][] = [
      triangle.vertices.map((p) => ({
        p,
        uv: {
          u: (p.x - min.x) / (max.x - min.x),
          v: 1 - (p.z - min.z) / (max.z - min.z),
        },
      })),
    ]
    for (const { b, d } of planes)
      polygons = polygons.flatMap((p) => split(p, b.nx, b.ny, d))
    for (const polygon of polygons) {
      for (const b of fold.bends) {
        const mid =
          polygon.reduce((sum, { p }) => sum + p.x * b.nx + p.z * b.ny, 0) /
          polygon.length
        if (
          mid > b.start + EPS &&
          mid < b.end - EPS &&
          polygon.some(({ p }) => {
            const along = -b.ny * p.x + b.nx * p.z
            return along < b.axisMin - EPS || along > b.axisMax + EPS
          })
        )
          throw new Error(
            `PCB bend ${b.id} must span the full board cross-section through its bend zone`,
          )
      }
      for (let i = 1; i + 1 < polygon.length; i++) {
        const verts = [polygon[0]!, polygon[i]!, polygon[i + 1]!]
        const vertices = verts.map(({ p }) =>
          swapPcbSceneAxes(fold.point(swapPcbSceneAxes(p))),
        ) as Triangle["vertices"]
        const [a, b, c] = vertices
        const u = { x: b.x - a.x, y: b.y - a.y, z: b.z - a.z },
          v = { x: c.x - a.x, y: c.y - a.y, z: c.z - a.z }
        const n = {
          x: u.y * v.z - u.z * v.y,
          y: u.z * v.x - u.x * v.z,
          z: u.x * v.y - u.y * v.x,
        }
        const l = Math.hypot(n.x, n.y, n.z)
        if (l < 1e-12) continue
        triangles.push({
          ...triangle,
          vertices,
          normal: { x: n.x / l, y: n.y / l, z: n.z / l },
          pcbFace: face,
          uvs: verts.map(({ uv }) => uv) as NonNullable<Triangle["uvs"]>,
        })
      }
    }
  }
  return { ...mesh, triangles, boundingBox: boundsOfTriangles(triangles) }
}

/** Temporary structural input matching circuit-json PR #816. Geometry is flat
 * board-local Circuit JSON (+Z up, mm); polygon outlines are already positioned.
 */
export type PcbStiffenerRecord = {
  type: "pcb_stiffener"
  pcb_stiffener_id: string
  pcb_board_id: string
  name?: string
  pcb_group_id?: string
  subcircuit_id?: string
  layer: "top" | "bottom"
  material: "fr4" | "polyimide" | "stainless_steel" | "aluminum"
  thickness: number
  adhesive_thickness?: number
} & (
  | {
      shape: "rect"
      center: { x: number; y: number }
      width: number
      height: number
      rotation?: number
    }
  | { shape: "polygon"; outline: { x: number; y: number }[] }
)
