import {
  type CircuitJson,
  type CadComponent,
  type PcbBoard,
  type PcbHole,
  type PCBPlatedHole,
  type PcbCutout,
  type PcbCopperPour,
  type PcbPanel,
} from "circuit-json"
import { cju } from "@tscircuit/circuit-json-util"
import type {
  Box3D,
  Scene3D,
  CircuitTo3DOptions,
  Camera3D,
  Light3D,
  STLMesh,
  PcbBoardWithId,
  PcbPanelWithExtras,
  PcbHoleWithBoardId,
  PcbPlatedHoleWithBoardId,
  PcbCutoutWithBoardId,
  PcbCopperPourWithBoardId,
  PcbBoardExtended,
} from "../types"
import { loadSTL } from "../loaders/stl"
import { loadOBJ } from "../loaders/obj"
import { loadGLB } from "../loaders/glb"
import { loadGLTF } from "../loaders/gltf"
import { loadFootprinterModel } from "../loaders/footprinter"
import { renderBoardTextures } from "./board-renderer"
import { COORDINATE_TRANSFORMS } from "../utils/coordinate-transform"
import { scaleMesh } from "../utils/mesh-scale"
import {
  createBoardMesh,
  createBoundingBox,
  geom3ToTriangles,
  type BoardCutout,
} from "../utils/pcb-board-geometry"
import { extrudeLinear } from "@jscad/modeling/src/operations/extrusions"
import { polygon } from "@jscad/modeling/src/primitives"
import { rotateX, translate } from "@jscad/modeling/src/operations/transforms"
import * as geom3 from "@jscad/modeling/src/geometries/geom3"
import measureBoundingBox from "@jscad/modeling/src/measurements/measureBoundingBox"
import { arePointsClockwise } from "../utils/pcb-board-cutouts"
import type { Vec2 } from "@jscad/modeling/src/maths/types"

const DEFAULT_BOARD_THICKNESS = 1.6 // mm
const DEFAULT_COMPONENT_HEIGHT = 2 // mm
const DEFAULT_BOARD_DIMENSION = 100 // mm
const COPPER_THICKNESS = 0.035
const PANEL_CUTOUT_CLEARANCE = 0.25

function getBestCameraPositionFromCircuitJson(
  pcbBoards: PcbBoard[],
  pcbPanels: PcbPanelWithExtras[],
): Camera3D {
  if (pcbPanels.length > 0) {
    const panel = pcbPanels[0]!
    const panelCenter = panel.center ?? { x: 0, y: 0 }
    const panelWidth = panel.width ?? DEFAULT_BOARD_DIMENSION
    const panelHeight = panel.height ?? DEFAULT_BOARD_DIMENSION

    const panelDiagonal = Math.sqrt(
      panelWidth * panelWidth + panelHeight * panelHeight,
    )
    const cameraDistance = panelDiagonal * 1.5

    return {
      position: {
        x: panelCenter.x + cameraDistance * 0.5,
        y: cameraDistance * 0.7,
        z: panelCenter.y + cameraDistance * 0.5,
      },
      target: {
        x: panelCenter.x,
        y: 0,
        z: panelCenter.y,
      },
      up: { x: 0, y: 1, z: 0 },
      fov: 50,
      near: 0.1,
      far: cameraDistance * 4,
    }
  }

  if (pcbBoards.length > 0) {
    const board = pcbBoards[0]!
    const boardWidth = board.width ?? DEFAULT_BOARD_DIMENSION
    const boardHeight = board.height ?? DEFAULT_BOARD_DIMENSION
    const boardDiagonal = Math.sqrt(
      boardWidth * boardWidth + boardHeight * boardHeight,
    )
    const cameraDistance = boardDiagonal * 1.5

    return {
      position: {
        x: board.center.x + cameraDistance * 0.5,
        y: cameraDistance * 0.7,
        z: board.center.y + cameraDistance * 0.5,
      },
      target: {
        x: board.center.x,
        y: 0,
        z: board.center.y,
      },
      up: { x: 0, y: 1, z: 0 },
      fov: 50,
      near: 0.1,
      far: cameraDistance * 4,
    }
  }

  // Fallback to default camera
  return {
    position: { x: 30, y: 30, z: 25 },
    target: { x: 0, y: 0, z: 0 },
    up: { x: 0, y: 1, z: 0 },
    fov: 50,
    near: 0.1,
    far: 120,
  }
}

function convertRotationFromCadRotation(rot: {
  x: number
  y: number
  z: number
}): { x: number; y: number; z: number } {
  return {
    x: (rot.x * Math.PI) / 180,
    y: (rot.y * Math.PI) / 180,
    z: (rot.z * Math.PI) / 180,
  }
}

export async function convertCircuitJsonTo3D(
  circuitJson: CircuitJson,
  options: CircuitTo3DOptions = {},
): Promise<Scene3D> {
  const {
    pcbColor = "rgba(0,140,0,0.8)",
    componentColor = "rgba(128,128,128,0.5)",
    copperColor = "#C87B4B",
    boardThickness = DEFAULT_BOARD_THICKNESS,
    defaultComponentHeight = DEFAULT_COMPONENT_HEIGHT,
    renderBoardTextures: shouldRenderTextures = true,
    textureResolution = 1024,
    coordinateTransform,
    showBoundingBoxes = true,
  } = options

  const db: any = cju(circuitJson)
  const boxes: Box3D[] = []

  const pcbBoards = (db.pcb_board?.list?.() ?? []) as PcbBoardExtended[]
  const pcbPanels = (db.pcb_panel?.list?.() ?? []) as PcbPanelWithExtras[]
  const pcbThickness = boardThickness ?? DEFAULT_BOARD_THICKNESS

  const boardsByPanelId = new Map<string, PcbBoardExtended[]>()
  const boardsWithoutPanel: PcbBoardExtended[] = []

  for (const pcbBoard of pcbBoards) {
    const panelId = pcbBoard.pcb_panel_id
    if (panelId) {
      if (!boardsByPanelId.has(panelId)) boardsByPanelId.set(panelId, [])
      boardsByPanelId.get(panelId)!.push(pcbBoard)
    } else {
      boardsWithoutPanel.push(pcbBoard)
    }
  }

  const pcbHoles = (db.pcb_hole?.list?.() ?? []) as PcbHoleWithBoardId[]
  const pcbPlatedHoles = (db.pcb_plated_hole?.list?.() ??
    []) as PcbPlatedHoleWithBoardId[]
  const pcbCutouts = (db.pcb_cutout?.list?.() ?? []) as PcbCutoutWithBoardId[]

  const shouldRenderBoardTextures =
    shouldRenderTextures && textureResolution > 0 && pcbBoards.length === 1

  let unassignedBoardsConsumed = false

  for (const panel of pcbPanels) {
    const panelId = panel.pcb_panel_id
    const panelCenter = panel.center ?? { x: 0, y: 0 }
    const panelWidth = panel.width
    const panelHeight = panel.height
    if (!panelWidth || !panelHeight) continue

    const panelThickness = panel.thickness ?? pcbThickness

    const explicitCutouts = Array.isArray(panel.cutouts) ? panel.cutouts : []

    const boardsForPanel = (() => {
      const linkedBoards = boardsByPanelId.get(panelId) ?? []
      if (linkedBoards.length > 0) {
        return linkedBoards
      }
      if (!unassignedBoardsConsumed && boardsWithoutPanel.length > 0) {
        unassignedBoardsConsumed = true
        return boardsWithoutPanel
      }
      return []
    })()

    const boardCutouts: BoardCutout[] = boardsForPanel
      .map((board, index) => {
        const boardCenter = board.center ?? { x: 0, y: 0 }
        if (Array.isArray(board.outline) && board.outline.length >= 3) {
          return {
            type: "pcb_cutout",
            pcb_cutout_id: `${panelId ?? "panel"}-cutout-${
              board.pcb_board_id ?? index
            }`,
            shape: "polygon",
            points: board.outline.map((point) => ({ x: point.x, y: point.y })),
          } as BoardCutout
        }

        const width = board.width ?? 0
        const height = board.height ?? 0

        // Warn if board has no dimensions
        if (width <= 0 || height <= 0) {
          console.warn(
            `Board ${board.pcb_board_id ?? index} has invalid dimensions (${width}x${height}), skipping cutout`,
          )
          return null
        }

        return {
          type: "pcb_cutout",
          pcb_cutout_id: `${panelId ?? "panel"}-cutout-${
            board.pcb_board_id ?? index
          }`,
          shape: "rect",
          center: { x: boardCenter.x, y: boardCenter.y },
          width: width + PANEL_CUTOUT_CLEARANCE * 2,
          height: height + PANEL_CUTOUT_CLEARANCE * 2,
        } as BoardCutout
      })
      .filter((cutout): cutout is BoardCutout => cutout !== null)

    const panelLikeBoard: Partial<PcbBoard> = {
      center: panelCenter,
      width: panelWidth,
      height: panelHeight,
      thickness: panelThickness,
    }

    const panelMesh = createBoardMesh(panelLikeBoard as PcbBoard, {
      thickness: panelThickness,
      cutouts: [...explicitCutouts, ...boardCutouts],
    })

    const meshWidth = panelMesh.boundingBox.max.x - panelMesh.boundingBox.min.x
    const meshHeight = panelMesh.boundingBox.max.z - panelMesh.boundingBox.min.z

    const panelColor =
      panel.covered_with_solder_mask === false
        ? "rgba(194,155,96,0.9)"
        : pcbColor

    boxes.push({
      center: { x: panelCenter.x, y: 0, z: panelCenter.y },
      size: {
        x: meshWidth > 0 ? meshWidth : panelWidth,
        y: panelThickness,
        z: meshHeight > 0 ? meshHeight : panelHeight,
      },
      mesh: panelMesh,
      color: panelColor,
    })
  }

  for (const pcbBoard of pcbBoards) {
    const boardId = pcbBoard.pcb_board_id

    const boardMesh = createBoardMesh(pcbBoard, {
      thickness: pcbThickness,
      holes: pcbHoles.filter(
        (item) => !item.pcb_board_id || item.pcb_board_id === boardId,
      ) as PcbHole[],
      platedHoles: pcbPlatedHoles.filter(
        (item) => !item.pcb_board_id || item.pcb_board_id === boardId,
      ) as PCBPlatedHole[],
      cutouts: pcbCutouts.filter(
        (item) => !item.pcb_board_id || item.pcb_board_id === boardId,
      ) as PcbCutout[],
    })

    const meshWidth = boardMesh.boundingBox.max.x - boardMesh.boundingBox.min.x
    const meshHeight = boardMesh.boundingBox.max.z - boardMesh.boundingBox.min.z

    const boardBox: Box3D = {
      center: {
        x: pcbBoard.center.x,
        y: 0,
        z: pcbBoard.center.y,
      },
      size: {
        x:
          meshWidth > 0
            ? meshWidth
            : (pcbBoard.width ?? DEFAULT_BOARD_DIMENSION),
        y: pcbThickness,
        z:
          meshHeight > 0
            ? meshHeight
            : (pcbBoard.height ?? DEFAULT_BOARD_DIMENSION),
      },
      mesh: boardMesh,
      color: pcbColor,
    }

    if (shouldRenderBoardTextures) {
      try {
        const textures = await renderBoardTextures(
          circuitJson,
          textureResolution,
        )
        boardBox.texture = {
          top: textures.top,
          bottom: textures.bottom,
        }
      } catch (error) {
        console.warn("Failed to render board textures:", error)
        boardBox.color = pcbColor
      }
    } else {
      boardBox.color = pcbColor
    }

    boxes.push(boardBox)
  }

  const pcbPours = (db.pcb_copper_pour?.list?.() ??
    []) as PcbCopperPourWithBoardId[]

  for (const pour of pcbPours) {
    const isBottomLayer = pour.layer === "bottom"
    const boardId = pour.pcb_board_id
    const y = isBottomLayer
      ? -(pcbThickness / 2) - COPPER_THICKNESS / 2
      : pcbThickness / 2 + COPPER_THICKNESS / 2

    if (pour.shape === "rect") {
      const box: Box3D = {
        center: {
          x: pour.center.x,
          y,
          z: pour.center.y,
        },
        size: {
          x: pour.width,
          y: COPPER_THICKNESS,
          z: pour.height,
        },
        rotation: { x: 0, y: 0, z: 0 },
        color: pour.covered_with_solder_mask ? pcbColor : copperColor,
      }
      if (pour.rotation && typeof pour.rotation === "number") {
        box.rotation!.y = -(pour.rotation * Math.PI) / 180
      }
      boxes.push(box)
    } else if (pour.shape === "polygon") {
      const { points } = pour

      // calculate center of polygon
      let centerX = 0
      let centerY = 0
      for (const p of points) {
        centerX += p.x
        centerY += p.y
      }
      centerX /= points.length
      centerY /= points.length

      const relativePoints: Vec2[] = points.map(
        (p: { x: number; y: number }) => [p.x - centerX, -(p.y - centerY)],
      )
      if (arePointsClockwise(relativePoints)) {
        relativePoints.reverse()
      }

      const shape2d = polygon({ points: relativePoints })
      let geom = extrudeLinear({ height: COPPER_THICKNESS }, shape2d)
      geom = translate([0, 0, -COPPER_THICKNESS / 2], geom) // center on Z
      geom = rotateX(-Math.PI / 2, geom)

      const triangles = geom3ToTriangles(geom)
      const bbox = createBoundingBox(measureBoundingBox(geom))

      const mesh: STLMesh = { triangles, boundingBox: bbox }

      const box: Box3D = {
        center: { x: centerX, y, z: centerY },
        size: { x: 1, y: 1, z: 1 }, // size doesn't matter much as we provide mesh
        mesh,
        color: pour.covered_with_solder_mask ? pcbColor : copperColor,
      }
      boxes.push(box)
    }
  }

  // Process CAD components (3D models)
  const cadComponents = (db.cad_component?.list?.() ?? []) as CadComponent[]
  const pcbComponentIdsWith3D = new Set<string>()

  for (const cad of cadComponents) {
    const { model_stl_url, model_obj_url, model_glb_url, model_gltf_url } = cad

    const hasFootprinterModel = Boolean(
      cad.footprinter_string &&
        !model_stl_url &&
        !model_obj_url &&
        !model_glb_url &&
        !model_gltf_url,
    )

    const hasModelSource = Boolean(
      model_stl_url ||
        model_obj_url ||
        model_glb_url ||
        model_gltf_url ||
        hasFootprinterModel,
    )

    if (!hasModelSource) continue

    pcbComponentIdsWith3D.add(cad.pcb_component_id)

    // Get the associated PCB component
    const pcbComponent = db.pcb_component.get(cad.pcb_component_id)

    // Check if component is on bottom layer
    const isBottomLayer = pcbComponent?.layer === "bottom"

    const modelScaleFactor = cad.model_unit_to_mm_scale_factor ?? 1

    // Determine size
    const size = cad.size
      ? {
          x: cad.size.x * modelScaleFactor,
          y: cad.size.y * modelScaleFactor,
          z: cad.size.z * modelScaleFactor,
        }
      : {
          x: pcbComponent?.width ?? 2,
          y: defaultComponentHeight,
          z: pcbComponent?.height ?? 2,
        }

    // Determine position
    const center = cad.position
      ? {
          x: cad.position.x,
          y: cad.position.z,
          z: cad.position.y,
        }
      : {
          x: pcbComponent?.center.x ?? 0,
          y: isBottomLayer
            ? -(pcbThickness / 2 + size.y / 2)
            : pcbThickness / 2 + size.y / 2,
          z: pcbComponent?.center.y ?? 0,
        }

    const meshType = model_stl_url
      ? "stl"
      : model_obj_url
        ? "obj"
        : model_gltf_url
          ? "gltf"
          : model_glb_url
            ? "glb"
            : hasFootprinterModel
              ? "glb"
              : undefined
    const box: Box3D = {
      center,
      size,
    }

    if (model_stl_url || model_obj_url || model_glb_url || model_gltf_url) {
      box.meshUrl =
        model_stl_url || model_obj_url || model_glb_url || model_gltf_url
      box.meshType = meshType
    }

    // Add rotation if specified
    if (cad.rotation) {
      // For GLB/GLTF models, we need to remap rotation axes because the coordinate
      // system has Y and Z swapped. Circuit JSON uses Z-up, but the transformed
      // model uses Y-up.
      box.rotation = convertRotationFromCadRotation({
        x: cad.rotation.x,
        y: cad.rotation.z, // Circuit Z rotation becomes model Y rotation
        z: cad.rotation.y, // Circuit Y rotation becomes model Z rotation
      })
    } else if (isBottomLayer) {
      // If no rotation specified but component is on bottom, flip it
      if (model_glb_url || model_gltf_url || hasFootprinterModel) {
        box.rotation = convertRotationFromCadRotation({
          x: 0,
          y: 0,
          z: 180, // Flip via Z rotation for GLB models (matches circuit JSON convention)
        })
      } else {
        box.rotation = convertRotationFromCadRotation({
          x: 180,
          y: 0,
          z: 0,
        })
      }
    }

    // Try to load the mesh with default coordinate transform if none specified
    // Note: GLB loader handles its own default Y/Z swap, so we pass through coordinateTransform
    // Different model formats use different coordinate conventions:
    // - OBJ models typically have Z-up with origin at the bottom
    // - STL models vary widely
    // - GLB/GLTF have their own conventions
    const usingGlbCoordinates = Boolean(model_glb_url || model_gltf_url)
    const usingObjFormat = Boolean(model_obj_url)

    const defaultTransform =
      coordinateTransform ??
      (usingGlbCoordinates
        ? undefined // GLB loader has its own default transform
        : hasFootprinterModel
          ? COORDINATE_TRANSFORMS.FOOTPRINTER_MODEL_TRANSFORM
          : usingObjFormat
            ? COORDINATE_TRANSFORMS.OBJ_Z_UP_TO_Y_UP
            : COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP_USB_FIX)

    if (model_stl_url) {
      box.mesh = await loadSTL(model_stl_url, defaultTransform)
    } else if (model_obj_url) {
      box.mesh = await loadOBJ(model_obj_url, defaultTransform)
    } else if (model_glb_url) {
      box.mesh = await loadGLB(model_glb_url, defaultTransform)
    } else if (model_gltf_url) {
      box.mesh = await loadGLTF(model_gltf_url, defaultTransform)
    } else if (hasFootprinterModel && cad.footprinter_string) {
      box.mesh = await loadFootprinterModel(
        cad.footprinter_string,
        defaultTransform,
      )
    }

    if (box.mesh && modelScaleFactor !== 1) {
      box.mesh = scaleMesh(box.mesh, modelScaleFactor)
    }

    // Adjust position if mesh was loaded and position was explicitly set
    // OBJ models typically have their origin at the bottom, so when position.z is specified,
    // it should be treated as the bottom of the component rather than the center
    if (box.mesh && cad.position && usingObjFormat) {
      const meshBottom = box.mesh.boundingBox.min.y
      // Adjust center Y so that (center.y + meshBottom) equals the intended position
      // This makes the bottom of the mesh align with position.z
      box.center.y -= meshBottom
    }

    // Only set color if mesh loading failed (fallback to simple box)
    if (!box.mesh) {
      box.color = componentColor
    }

    boxes.push(box)
  }

  // Add generic boxes for components without 3D models (only if showBoundingBoxes is true)
  if (showBoundingBoxes) {
    for (const component of db.pcb_component.list()) {
      if (pcbComponentIdsWith3D.has(component.pcb_component_id)) continue

      const sourceComponent = db.source_component.get(
        component.source_component_id,
      )
      const compHeight = Math.min(
        Math.min(component.width, component.height),
        defaultComponentHeight,
      )

      // Check if component is on bottom layer
      const isBottomLayer = component.layer === "bottom"

      boxes.push({
        center: {
          x: component.center.x,
          y: isBottomLayer
            ? -(pcbThickness / 2 + compHeight / 2)
            : pcbThickness / 2 + compHeight / 2,
          z: component.center.y,
        },
        size: {
          x: component.width,
          y: compHeight,
          z: component.height,
        },
        color: componentColor,
        label: sourceComponent?.name ?? "?",
        labelColor: "white",
      })
    }
  }

  // Create a default camera positioned to view the board or panel
  const camera = getBestCameraPositionFromCircuitJson(pcbBoards, pcbPanels)

  // Add some default lights
  const lights: Light3D[] = [
    {
      type: "ambient",
      color: "white",
      intensity: 0.5,
    },
    {
      type: "directional",
      color: "white",
      intensity: 0.5,
      direction: { x: -1, y: -1, z: -1 },
    },
  ]

  return {
    boxes,
    camera,
    lights,
  }
}
