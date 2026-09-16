import type { CadComponent, CircuitJson, PcbBoard } from "circuit-json"
import type {
  AuthHeaders,
  BoundingBox,
  Box3D,
  OBJMesh,
  STLMesh,
} from "../types"
import { transformMesh } from "../gltf/geometry"
import { boundsOfTriangles } from "../utils/bounding-box"
import { prepareBoardMesh } from "./prepare-board-mesh"
import { prepareCad } from "./prepare-cad"
import { resolveGeometryBoardId } from "./board-ownership"
import { getBoundingBoxSize } from "../utils/mesh-scale"

export { resolveGeometryBoardId } from "./board-ownership"
export type {
  AuthHeaders,
  BoundingBox,
  OBJMaterial,
  OBJMesh,
  Point3,
  STLMesh,
  Triangle,
} from "../types"

export type BoardFromMesh = readonly [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
]

export interface GeometryAssetContext {
  projectBaseUrl?: string
  authHeaders?: AuthHeaders
  /** Absolute URL for the packaged OCCT WASM asset in browser/worker builds. */
  stepWasmUrl?: string
}

export interface SupplementalModelMetadata {
  byCadComponentId?: Record<
    string,
    Partial<
      Pick<
        CadComponent,
        | "model_origin_position"
        | "model_origin_alignment"
        | "model_board_normal_direction"
        | "model_object_fit"
        | "model_unit_to_mm_scale_factor"
      >
    >
  >
  excludedCadComponentIds?: string[]
  excludedPcbComponentIds?: string[]
}

interface GeometryIdentity {
  pcbBoardId: string
  cadComponentId?: string
  pcbComponentId?: string
  source: string
}

/**
 * Mesh vertices retain exporter loader normalization, unit conversion, board
 * normal alignment, origin translation and fitting, in intermediate Y-up mm.
 * They are NOT original asset vertices. Embedded glTF node transforms are baked.
 *
 * boardFromMesh maps these actual vertices to right-handed board-local XYZ,
 * Z-up mm, centered on the selected board, with Z=0 at its midplane. It includes
 * remaining CAD rotation and the scene Y/Z swap (a reflection). Consumers baking
 * it must transform normals and account for winding; topology is NOT validated.
 * Bounds are measured on transformed vertices, not transformed AABB corners.
 */
export type PreparedGeometryOccurrence = GeometryIdentity &
  (
    | {
        status: "available"
        mesh: STLMesh | OBJMesh
        boardFromMesh: BoardFromMesh
        bounds: BoundingBox
        topology: "unchecked"
      }
    | { status: "unavailable"; reason: string }
  )

export interface PrepareBoardGeometryOptions {
  circuitJson: CircuitJson
  pcbBoardId: string
  supplementalModelMetadata?: SupplementalModelMetadata
  assetContext?: GeometryAssetContext
}

export interface PreparedBoardGeometry {
  pcbBoardId: string
  board: PreparedGeometryOccurrence & { status: "available" }
  components: PreparedGeometryOccurrence[]
  diagnostics: { cadComponentId: string; field: string; message: string }[]
}

function occurrence(
  identity: GeometryIdentity,
  box: Box3D,
  board: PcbBoard,
): PreparedGeometryOccurrence {
  if (!box.mesh?.triangles.length) {
    return {
      ...identity,
      status: "unavailable",
      reason: "No supported model geometry was produced",
    }
  }
  if (
    box.mesh.triangles.some((triangle) =>
      triangle.vertices.some(
        (vertex) => !Object.values(vertex).every(Number.isFinite),
      ),
    )
  )
    throw new Error(
      `Non-finite vertices for CAD ${identity.cadComponentId ?? identity.pcbBoardId}`,
    )
  // Reuse the exporter's Y(-angle), X, Z rotation order, not mesh-scale's XYZ.
  // No world translation is added until after subtracting the board center.
  const basis = transformMesh(
    {
      positions: [1, 0, 0, 0, 1, 0, 0, 0, 1],
      normals: [],
      texcoords: [],
      indices: [],
    },
    { x: 0, y: 0, z: 0 },
    box.rotation,
  ).positions
  const boardFromMesh: BoardFromMesh = [
    basis[0]!,
    basis[2]!,
    basis[1]!,
    0,
    basis[3]!,
    basis[5]!,
    basis[4]!,
    0,
    basis[6]!,
    basis[8]!,
    basis[7]!,
    0,
    box.center.x - board.center.x,
    box.center.z - board.center.y,
    box.center.y,
    1,
  ]
  if (!boardFromMesh.every(Number.isFinite))
    throw new Error(
      `Non-finite placement for CAD ${identity.cadComponentId ?? identity.pcbBoardId}`,
    )
  const placed = box.mesh.triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map((v) => ({
      x:
        boardFromMesh[0] * v.x +
        boardFromMesh[4] * v.y +
        boardFromMesh[8] * v.z +
        boardFromMesh[12],
      y:
        boardFromMesh[1] * v.x +
        boardFromMesh[5] * v.y +
        boardFromMesh[9] * v.z +
        boardFromMesh[13],
      z:
        boardFromMesh[2] * v.x +
        boardFromMesh[6] * v.y +
        boardFromMesh[10] * v.z +
        boardFromMesh[14],
    })) as typeof triangle.vertices,
  }))
  const bounds = boundsOfTriangles(placed)
  if (
    ![...Object.values(bounds.min), ...Object.values(bounds.max)].every(
      Number.isFinite,
    )
  ) {
    throw new Error(
      `Non-finite geometry for CAD ${identity.cadComponentId ?? identity.pcbBoardId}`,
    )
  }
  return {
    ...identity,
    status: "available",
    mesh: box.mesh,
    boardFromMesh,
    bounds,
    topology: "unchecked",
  }
}

export async function prepareBoardGeometry({
  circuitJson,
  pcbBoardId,
  supplementalModelMetadata,
  assetContext,
}: PrepareBoardGeometryOptions): Promise<PreparedBoardGeometry> {
  const boards = circuitJson.filter((item) => item.type === "pcb_board")
  const selected = boards.filter((item) => item.pcb_board_id === pcbBoardId)
  if (selected.length !== 1)
    throw new Error(
      `Expected exactly one pcb_board for ${pcbBoardId}, found ${selected.length}`,
    )
  const board = selected[0]!
  if (
    circuitJson.some((item) => item.type === "pcb_panel") ||
    board.carrier_pcb_board_id ||
    board.is_mounted_to_carrier_board
  ) {
    throw new Error(
      "Panel/carrier geometry is not supported by prepareBoardGeometry",
    )
  }
  const mesh = prepareBoardMesh(circuitJson, board, {
    thickness: board.thickness ?? 1.6,
    drillQuality: "fast",
    strictOwnership: true,
  })
  const preparedBoard = occurrence(
    { pcbBoardId, source: "board" },
    {
      mesh,
      center: { x: board.center.x, y: 0, z: board.center.y },
      size: getBoundingBoxSize(mesh.boundingBox),
    },
    board,
  )
  if (preparedBoard.status !== "available")
    throw new Error(`Board ${pcbBoardId} has no geometry`)
  const components: PreparedGeometryOccurrence[] = []
  const diagnostics: PreparedBoardGeometry["diagnostics"] = []
  const cadIds = new Set<string>()
  for (const original of circuitJson.filter(
    (item) => item.type === "cad_component",
  )) {
    if (
      supplementalModelMetadata?.excludedCadComponentIds?.includes(
        original.cad_component_id,
      ) ||
      supplementalModelMetadata?.excludedPcbComponentIds?.includes(
        original.pcb_component_id,
      )
    )
      continue
    if (cadIds.has(original.cad_component_id))
      throw new Error(`Duplicate CAD identity ${original.cad_component_id}`)
    cadIds.add(original.cad_component_id)
    const owners = circuitJson.filter(
      (item) =>
        item.type === "pcb_component" &&
        item.pcb_component_id === original.pcb_component_id,
    )
    if (owners.length > 1)
      throw new Error(
        `Duplicate PCB owner identity ${original.pcb_component_id}`,
      )
    const owner = owners[0]
    if (owner?.type !== "pcb_component") {
      throw new Error(
        `CAD ${original.cad_component_id} has no PCB owner ${original.pcb_component_id}`,
      )
    }
    const ownerBoardId = resolveGeometryBoardId(circuitJson, owner)
    if (ownerBoardId === undefined) {
      throw new Error(
        `PCB ${owner.pcb_component_id} has ambiguous board ownership`,
      )
    }
    if (ownerBoardId !== pcbBoardId || owner.do_not_place) continue
    const supplemental =
      supplementalModelMetadata?.byCadComponentId?.[original.cad_component_id]
    for (const field of [
      "model_origin_position",
      "model_origin_alignment",
      "model_board_normal_direction",
      "model_object_fit",
      "model_unit_to_mm_scale_factor",
    ] as const) {
      if (
        original[field] !== undefined &&
        supplemental?.[field] !== undefined &&
        JSON.stringify(original[field]) !== JSON.stringify(supplemental[field])
      ) {
        diagnostics.push({
          cadComponentId: original.cad_component_id,
          field,
          message:
            "Circuit JSON value takes precedence over supplemental metadata",
        })
      }
    }
    const cad: CadComponent = {
      ...original,
      model_origin_position:
        original.model_origin_position ?? supplemental?.model_origin_position,
      model_origin_alignment:
        original.model_origin_alignment ?? supplemental?.model_origin_alignment,
      model_board_normal_direction:
        original.model_board_normal_direction ??
        supplemental?.model_board_normal_direction,
      model_object_fit:
        original.model_object_fit ?? supplemental?.model_object_fit,
      model_unit_to_mm_scale_factor:
        original.model_unit_to_mm_scale_factor ??
        supplemental?.model_unit_to_mm_scale_factor,
    }
    const { box, source } = await prepareCad(
      cad,
      circuitJson,
      assetContext ?? {},
      board.thickness ?? 1.6,
    )
    components.push(
      occurrence(
        {
          pcbBoardId,
          cadComponentId: cad.cad_component_id,
          pcbComponentId: cad.pcb_component_id,
          source,
        },
        box,
        board,
      ),
    )
  }
  return { pcbBoardId, board: preparedBoard, components, diagnostics }
}
