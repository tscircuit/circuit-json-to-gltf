import { createExplosionLineBoxes } from "./explosion-lines"
import { evaluateAssemblyExplosion } from "../utils/evaluate-assembly-explosion"
import { loadCadComponentBox } from "../loaders/cad-component-box"
import {
  getPadOverlappingVias,
  viaDrills,
  splitViaWalls,
} from "../utils/pad-overlapping-vias"
import { createReferenceSurfaceBox } from "./reference-surface"
import {
  createStiffenerMesh,
  tryFoldStiffenerMesh,
  transformCircuitJsonCadComponents,
  type PcbFoldIssue,
  type Point2,
} from "@tscircuit/flex-utils"
import { swapMeshFrame } from "../utils/pcb-fold"
import {
  tryCreatePcbFold,
  tryFoldBoardMesh,
  type PcbFold,
  type PcbBendRecord,
  type PcbStiffenerRecord,
} from "../utils/pcb-fold"
import { tryFoldRigidBox } from "../utils/fold-rigid-box"
import { withCircuitJsonErrors } from "../utils/circuit-json-errors"
import { cju, findBoundsAndCenter } from "@tscircuit/circuit-json-util"
import type {
  CadComponent,
  CircuitJson,
  PcbCutout,
  PcbHole,
  PcbPanel,
  PcbPlatedHole,
} from "circuit-json"
import { loadCable } from "../loaders/cable"
import type {
  Box3D,
  Camera3D,
  CircuitTo3DOptions,
  CircuitJsonWithPcbFlex,
  Light3D,
  Point3,
  Scene3D,
} from "../types"
import { getBoundingBoxSize } from "../utils/mesh-scale"
import { filterCutoutsForBoard } from "../utils/pcb-board-cutouts"
import { createBoardMesh } from "../utils/pcb-board-geometry"
import { createPanelMesh } from "../utils/pcb-panel-geometry"
import {
  colorToCssString,
  getBoardColorPalette,
  getSpecifiedColor,
} from "../utils/board-color-palette"
import { renderBoardTextures } from "./board-renderer"

const DEFAULT_BOARD_THICKNESS = 1.6 // mm
const DEFAULT_COMPONENT_HEIGHT = 2 // mm
const COPPER_THICKNESS = 0.035
const FAUX_BOARD_MARGIN = 2
const DEFAULT_FAUX_BOARD_SIZE = 10

export async function convertCircuitJsonTo3D(
  inputCircuitJson: CircuitJsonWithPcbFlex,
  options: CircuitTo3DOptions = {},
): Promise<Scene3D> {
  // Explosion translations are circuit-world vectors. Resolve them before the
  // existing CAD-to-scene axis mapping in loadCadComponentBox.
  const explosion = options.explosion
    ? evaluateAssemblyExplosion(inputCircuitJson, options.explosion)
    : undefined
  if (explosion) inputCircuitJson = explosion.circuitJson

  const {
    boardSideColor,
    componentColor = "rgba(128,128,128,0.5)",
    copperColor = "#C87B4B",
    silkscreenColor,
    solderMaskWithCopperColor,
    drillColor,
    boardThickness = DEFAULT_BOARD_THICKNESS,
    boardDrillQuality = "fast",
    drawFauxBoard = false,
    defaultComponentHeight = DEFAULT_COMPONENT_HEIGHT,
    renderBoardTextures: shouldRenderTextures = true,
    textureResolution = 1024,
    showPcbNotes = false,
    coordinateTransform,
    showBoundingBoxes = false,
    projectBaseUrl,
    authHeaders,
  } = options

  const foldPcbs =
    options.foldPcbs ??
    inputCircuitJson.some(
      (element) =>
        element.type === "cad_component" && element.is_on_folded_board === true,
    )

  // Normalize pre-folded CAD before format-specific mesh loading. The same
  // shared inverse is used by core/viewer; PCB records remain flat.
  const circuitJson = transformCircuitJsonCadComponents(
    inputCircuitJson as CircuitJson,
    { foldPcbs: false },
  )
  const db: any = cju(circuitJson)
  const boxes: Box3D[] = []

  const pcbColorOverride =
    typeof options.pcbColor === "string"
      ? getSpecifiedColor(options.pcbColor)
      : options.pcbColor
  const palette = getBoardColorPalette(circuitJson, {
    solderMaskColor:
      pcbColorOverride !== undefined
        ? colorToCssString(pcbColorOverride)
        : undefined,
    silkscreenColor,
  })
  const resolvedPcbColor =
    pcbColorOverride ?? palette.backgroundColor ?? "rgba(0,140,0,0.8)"
  const resolvedBoardSideColor = boardSideColor ?? palette.boardSideColor

  const boardTextureColors = {
    backgroundColor: palette.backgroundColor,
    ...(typeof options.copperColor === "string"
      ? { copperColor: options.copperColor }
      : {}),
    silkscreenColor: silkscreenColor ?? palette.silkscreenColor,
    solderMaskWithCopperColor:
      solderMaskWithCopperColor ?? palette.solderMaskWithCopperColor,
    drillColor,
  }

  const pcbPanel = db.pcb_panel?.list?.()[0] as PcbPanel | undefined
  const pcbBoards = db.pcb_board?.list?.() ?? []
  const pcbBoard = pcbBoards[0]
  const pcbComponents = db.pcb_component?.list?.() ?? []
  const bends = inputCircuitJson.filter(
    (e): e is PcbBendRecord => e.type === "pcb_bend",
  )
  const stiffeners = inputCircuitJson.filter(
    (e): e is PcbStiffenerRecord => e.type === "pcb_stiffener",
  )
  if (
    (bends.length || stiffeners.length) &&
    (pcbPanel ||
      db.pcb_board.list().length !== 1 ||
      [...bends, ...stiffeners].some(
        (e) => e.pcb_board_id !== pcbBoard?.pcb_board_id,
      ))
  ) {
    throw new Error(
      "PCB flex rendering requires exactly one board, matching board references, and no panel",
    )
  }
  // Set the active fold only after both construction and board deformation
  // succeed. CAD and stiffeners then share the board's resolved fold state.
  let fold: PcbFold | undefined
  const reportFoldIssue = (label: string, issue: PcbFoldIssue) => {
    console.warn(
      `Unable to fold ${label}; keeping flat geometry: ${issue.message}`,
    )
  }

  // Panels don't have thickness, so always use board's thickness as fallback
  const effectiveBoardThickness = pcbBoard?.thickness ?? boardThickness

  // Render panel if present (panel takes priority)
  if (pcbPanel) {
    const pcbHoles = (db.pcb_hole?.list?.() ?? []) as PcbHole[]
    const pcbPlatedHoles = (db.pcb_plated_hole?.list?.() ??
      []) as PcbPlatedHole[]
    const pcbCutouts = (db.pcb_cutout?.list?.() ?? []) as PcbCutout[]
    // For panels, include cutouts that don't have a specific board ID (global cutouts)
    const panelCutouts = pcbCutouts.filter((cutout) => !cutout.pcb_board_id)

    const openVias = getPadOverlappingVias(circuitJson as CircuitJson)
    const drilledPanel = createPanelMesh(pcbPanel, {
      thickness: effectiveBoardThickness,
      holes: [...pcbHoles, ...viaDrills(openVias)],
      platedHoles: pcbPlatedHoles,
      cutouts: panelCutouts,
      drillQuality: boardDrillQuality,
    })

    const { board: panelMesh, copper: viaMesh } = splitViaWalls(
      drilledPanel,
      pcbPanel.center,
      openVias,
    )
    const meshWidth = panelMesh.boundingBox.max.x - panelMesh.boundingBox.min.x
    const meshHeight = panelMesh.boundingBox.max.z - panelMesh.boundingBox.min.z

    const panelBox: Box3D = {
      center: {
        x: pcbPanel.center.x,
        y: 0,
        z: pcbPanel.center.y,
      },
      size: {
        x: Number.isFinite(meshWidth) ? meshWidth : pcbPanel.width,
        y: effectiveBoardThickness,
        z: Number.isFinite(meshHeight) ? meshHeight : pcbPanel.height,
      },
      mesh: panelMesh,
      color: resolvedPcbColor,
      sideColor: resolvedBoardSideColor,
    }

    // Render panel textures if requested and resolution > 0
    if (shouldRenderTextures && textureResolution > 0) {
      try {
        const textures = await renderBoardTextures(circuitJson, {
          resolution: textureResolution,
          showPcbNotes,
          ...boardTextureColors,
        })
        panelBox.texture = {
          top: textures.top,
          bottom: textures.bottom,
        }
      } catch (error) {
        console.warn("Failed to render panel textures:", error)
        // If texture rendering fails, use the fallback color
        panelBox.color = resolvedPcbColor
      }
    } else {
      // No textures requested, use solid color
      panelBox.color = resolvedPcbColor
    }

    boxes.push(panelBox)
    if (viaMesh.triangles.length)
      boxes.push({
        ...panelBox,
        texture: undefined,
        mesh: viaMesh,
        color: boardTextureColors.copperColor ?? "#ffe066",
        label: "Via Plating",
      })
  } else if (pcbBoards.length) {
    for (const pcbBoard of pcbBoards) {
      const effectiveBoardThickness = pcbBoard.thickness ?? boardThickness
      const boardCircuitJson = circuitJson.filter((element: any) => {
        if (element.type === "pcb_board")
          return element.pcb_board_id === pcbBoard.pcb_board_id
        if (!element.type.startsWith("pcb_")) return true
        if (element.pcb_board_id)
          return element.pcb_board_id === pcbBoard.pcb_board_id
        return (
          pcbBoards.length === 1 ||
          element.subcircuit_id === pcbBoard.subcircuit_id
        )
      })
      const boardDb = cju(boardCircuitJson)
      // Create each PCB at its circuit-world XY position, using the existing
      // single-board mapping to glTF +Y-up below.

      const pcbHoles = (boardDb.pcb_hole?.list?.() ?? []) as PcbHole[]
      const pcbPlatedHoles = (boardDb.pcb_plated_hole?.list?.() ??
        []) as PcbPlatedHole[]
      const pcbCutouts = (boardDb.pcb_cutout?.list?.() ?? []) as PcbCutout[]
      const boardCutouts = filterCutoutsForBoard(pcbCutouts, pcbBoard)

      const openVias = getPadOverlappingVias(boardCircuitJson as CircuitJson)
      const drilledBoard = createBoardMesh(pcbBoard, {
        thickness: effectiveBoardThickness,
        mergeOverlappingHoles: openVias.length > 0,
        holes: [...pcbHoles, ...viaDrills(openVias)],
        platedHoles: pcbPlatedHoles,
        cutouts: boardCutouts,
        drillQuality: boardDrillQuality,
      })

      const { board: boardMesh, copper: viaMesh } = splitViaWalls(
        drilledBoard,
        pcbBoard.center,
        openVias,
      )
      const meshWidth =
        boardMesh.boundingBox.max.x - boardMesh.boundingBox.min.x
      const meshHeight =
        boardMesh.boundingBox.max.z - boardMesh.boundingBox.min.z

      let foldedBoardMesh = boardMesh
      if (foldPcbs && bends.length) {
        const foldResult = tryCreatePcbFold(bends, effectiveBoardThickness, {
          // Match flex-utils' getCadFoldContext: translate circuit-world XY mm
          // into board-local +Z-up points before the shared surface deformation.
          outline: pcbBoard.outline?.map((point: Point2) => ({
            x: point.x - pcbBoard.center.x,
            y: point.y - pcbBoard.center.y,
          })),
        })
        if (foldResult.ok) {
          const meshResult = tryFoldBoardMesh(boardMesh, foldResult.value)
          if (meshResult.ok) {
            fold = foldResult.value
            foldedBoardMesh = meshResult.value
          } else {
            reportFoldIssue(
              `PCB board ${pcbBoard.pcb_board_id}`,
              meshResult.issue,
            )
          }
        } else {
          reportFoldIssue(
            `PCB board ${pcbBoard.pcb_board_id}`,
            foldResult.issue,
          )
        }
      }
      const boardBox: Box3D = {
        center: {
          x: pcbBoard.center.x,
          y: 0,
          z: pcbBoard.center.y,
        },
        size: {
          x: Number.isFinite(meshWidth) ? meshWidth : pcbBoard.width,
          y: effectiveBoardThickness,
          z: Number.isFinite(meshHeight) ? meshHeight : pcbBoard.height,
        },
        mesh: foldedBoardMesh,
        color: resolvedPcbColor,
        sideColor: resolvedBoardSideColor,
      }

      // Render board textures if requested and resolution > 0
      if (shouldRenderTextures && textureResolution > 0) {
        try {
          const textures = await renderBoardTextures(boardCircuitJson, {
            resolution: textureResolution,
            showPcbNotes,
            ...boardTextureColors,
          })
          boardBox.texture = {
            top: textures.top,
            bottom: textures.bottom,
          }
        } catch (error) {
          console.warn("Failed to render board textures:", error)
          // If texture rendering fails, use the fallback color
          boardBox.color = resolvedPcbColor
        }
      } else {
        // No textures requested, use solid color
        boardBox.color = resolvedPcbColor
      }

      if (fold && boardBox.mesh)
        boardBox.size = getBoundingBoxSize(boardBox.mesh.boundingBox)
      boxes.push(boardBox)
      if (viaMesh.triangles.length) {
        const copperMesh = fold ? tryFoldBoardMesh(viaMesh, fold) : undefined
        boxes.push({
          ...boardBox,
          texture: undefined,
          mesh: copperMesh?.ok ? copperMesh.value : viaMesh,
          color: boardTextureColors.copperColor ?? "#ffe066",
          label: "Via Plating",
        })
      }
    }
  } else if (drawFauxBoard) {
    const hasComponentBounds = pcbComponents.length > 0
    const componentBounds = hasComponentBounds
      ? findBoundsAndCenter(pcbComponents as any)
      : null

    const fauxCenterX = componentBounds?.center.x ?? 0
    const fauxCenterY = componentBounds?.center.y ?? 0
    const fauxWidth = componentBounds
      ? Math.max(
          componentBounds.width + FAUX_BOARD_MARGIN * 2,
          DEFAULT_FAUX_BOARD_SIZE,
        )
      : DEFAULT_FAUX_BOARD_SIZE
    const fauxHeight = componentBounds
      ? Math.max(
          componentBounds.height + FAUX_BOARD_MARGIN * 2,
          DEFAULT_FAUX_BOARD_SIZE,
        )
      : DEFAULT_FAUX_BOARD_SIZE

    const fauxBoardBox: Box3D = {
      center: {
        x: fauxCenterX,
        y: fauxCenterY,
        z: 0,
      },
      size: {
        x: fauxWidth,
        y: effectiveBoardThickness,
        z: fauxHeight,
      },
      color: resolvedPcbColor,
      sideColor: resolvedBoardSideColor,
    }

    if (shouldRenderTextures && textureResolution > 0) {
      try {
        const fauxBoardId =
          pcbComponents.find(
            (component: { pcb_board_id?: string }) =>
              typeof component.pcb_board_id === "string",
          )?.pcb_board_id ?? "__faux_board__"

        const fauxBoardCircuitJson = [
          ...circuitJson,
          {
            type: "pcb_board",
            pcb_board_id: fauxBoardId,
            center: { x: fauxCenterX, y: fauxCenterY },
            width: fauxWidth,
            height: fauxHeight,
            thickness: effectiveBoardThickness,
          },
        ] as CircuitJson

        const textures = await renderBoardTextures(fauxBoardCircuitJson, {
          resolution: textureResolution,
          showPcbNotes,
          ...boardTextureColors,
        })

        fauxBoardBox.texture = {
          top: textures.top,
          bottom: textures.bottom,
        }
      } catch (error) {
        console.warn("Failed to render faux board textures:", error)
        fauxBoardBox.color = resolvedPcbColor
      }
    }

    boxes.push(fauxBoardBox)
  }

  // Process CAD components (3D models)
  const cadComponents = (db.cad_component?.list?.() ?? []) as CadComponent[]
  const pcbComponentIdsWith3D = new Set<string>()
  const pcbComponentIdsWithBoundingBox = new Set<string>()

  for (const cad of cadComponents) {
    if (cad.show_as_bounding_box && cad.pcb_component_id) {
      pcbComponentIdsWithBoundingBox.add(cad.pcb_component_id)
    }
    const pcbComponent = cad.pcb_component_id
      ? db.pcb_component.get(cad.pcb_component_id)
      : undefined
    const sourceComponent = db.source_component.get(cad.source_component_id)
    const box = await loadCadComponentBox(cad, {
      pcbComponent,
      componentName: sourceComponent?.name,
      componentColor,
      defaultComponentHeight,
      boardThickness: effectiveBoardThickness,
      showBoundingBoxes,
      coordinateTransform,
      projectBaseUrl,
      authHeaders,
      // Preserve the fold renderer's existing flat bottom-layer convention.
      defaultCadRotation:
        bends.length && pcbComponent
          ? {
              x: (cad.layer ?? pcbComponent.layer) === "bottom" ? 180 : 0,
              y: 0,
              z: 0,
            }
          : undefined,
    })
    if (!box) continue
    if (cad.pcb_component_id) pcbComponentIdsWith3D.add(cad.pcb_component_id)

    const result =
      fold && pcbComponent
        ? tryFoldRigidBox(box, fold, pcbBoard.center, pcbComponent.center)
        : undefined
    if (result && !result.ok)
      reportFoldIssue(`CAD component ${cad.cad_component_id}`, result.issue)
    boxes.push(result?.ok ? result.value : box)
  }

  if (options.showReferenceSurfaces) {
    for (const surface of inputCircuitJson) {
      if (surface.type !== "cad_reference_surface") continue
      const owner = db.source_component.get(surface.source_component_id)
      boxes.push(
        createReferenceSurfaceBox(surface, owner?.name ?? "unnamed part"),
      )
    }
  }

  // Add generic boxes for components without 3D models (only if showBoundingBoxes is true)
  if (showBoundingBoxes) {
    for (const component of pcbComponents) {
      if (pcbComponentIdsWith3D.has(component.pcb_component_id)) continue
      if (!pcbComponentIdsWithBoundingBox.has(component.pcb_component_id))
        continue

      const sourceComponent = db.source_component.get(
        component.source_component_id,
      )
      const compHeight = Math.min(
        Math.min(component.width, component.height),
        defaultComponentHeight,
      )

      // Check if component is on bottom layer
      const isBottomLayer = component.layer === "bottom"

      const box: Box3D = {
        center: {
          x: component.center.x,
          y: isBottomLayer
            ? -(effectiveBoardThickness + compHeight / 2)
            : effectiveBoardThickness / 2 + compHeight / 2,
          z: component.center.y,
        },
        size: {
          x: component.width,
          y: compHeight,
          z: component.height,
        },
        color: componentColor,
        label: sourceComponent?.name ?? "?",
        componentMetadata: {
          source_component_id: component.source_component_id,
          pcb_component_id: component.pcb_component_id,
          componentName: sourceComponent?.name,
        },
        labelColor: "white",
      }
      const result = fold
        ? tryFoldRigidBox(box, fold, pcbBoard.center, component.center)
        : undefined
      if (result && !result.ok)
        reportFoldIssue(
          `PCB component ${component.pcb_component_id}`,
          result.issue,
        )
      boxes.push(result?.ok ? result.value : box)
    }
  }

  for (const stiffener of stiffeners) {
    const flatMesh = createStiffenerMesh({
      stiffener,
      boardThickness: effectiveBoardThickness,
    })
    const result = fold
      ? tryFoldStiffenerMesh(flatMesh, stiffener, fold)
      : undefined
    if (result && !result.ok)
      reportFoldIssue(
        `PCB stiffener ${stiffener.pcb_stiffener_id}`,
        result.issue,
      )
    const mesh = swapMeshFrame(result?.ok ? result.value : flatMesh)
    boxes.push({
      center: { x: pcbBoard.center.x, y: 0, z: pcbBoard.center.y },
      size: getBoundingBoxSize(mesh.boundingBox),
      mesh,
      color:
        stiffener.material === "polyimide"
          ? "#bd7f27"
          : stiffener.material === "fr4"
            ? "#879568"
            : "#b8bdc4",
      label: stiffener.pcb_stiffener_id,
    })
  }

  for (const cable of circuitJson.filter(
    (element) => element.type === "cad_cable",
  )) {
    boxes.push(...loadCable(cable))
  }

  // Create a default camera positioned to view the board or components
  let camera: Camera3D

  if (pcbBoard) {
    const boardDiagonal = Math.sqrt(
      pcbBoard.width * pcbBoard.width + pcbBoard.height * pcbBoard.height,
    )
    const cameraDistance = boardDiagonal * 1.5

    camera = {
      position: {
        x: pcbBoard.center.x + cameraDistance * 0.5,
        y: cameraDistance * 0.7,
        z: pcbBoard.center.y + cameraDistance * 0.5,
      },
      target: {
        x: pcbBoard.center.x,
        y: 0,
        z: pcbBoard.center.y,
      },
      up: { x: 0, y: 1, z: 0 },
      fov: 50,
      near: 0.1,
      far: cameraDistance * 4,
    }
  } else {
    const hasBoxes = boxes.length > 0

    if (hasBoxes) {
      let minX = Infinity
      let minZ = Infinity
      let maxX = -Infinity
      let maxZ = -Infinity

      for (const box of boxes) {
        const halfX = (box.size?.x ?? 0) / 2
        const halfZ = (box.size?.z ?? 0) / 2

        minX = Math.min(minX, box.center.x - halfX)
        maxX = Math.max(maxX, box.center.x + halfX)
        minZ = Math.min(minZ, box.center.z - halfZ)
        maxZ = Math.max(maxZ, box.center.z + halfZ)
      }

      const width = Math.max(maxX - minX, 1)
      const height = Math.max(maxZ - minZ, 1)
      const diagonal = Math.sqrt(width * width + height * height)
      const distance = diagonal * 1.5
      const centerX = (minX + maxX) / 2
      const centerZ = (minZ + maxZ) / 2

      camera = {
        position: {
          x: centerX + distance * 0.5,
          y: distance * 0.7,
          z: centerZ + distance * 0.5,
        },
        target: { x: centerX, y: 0, z: centerZ },
        up: { x: 0, y: 1, z: 0 },
        fov: 50,
        near: 0.1,
        far: distance * 4,
      }
    } else {
      camera = {
        position: { x: 30, y: 30, z: 25 },
        target: { x: 0, y: 0, z: 0 },
        up: { x: 0, y: 1, z: 0 },
        fov: 50,
        near: 0.1,
        far: 120,
      }
    }
  }

  if (fold) {
    // Folded Scene3D meshes already contain their rotations (+Y up, mm).
    const points = boxes.flatMap(
      (box) =>
        box.mesh?.triangles.flatMap((t) =>
          t.vertices.map((p) => ({
            x: p.x + box.center.x,
            y: p.y + box.center.y,
            z: p.z + box.center.z,
          })),
        ) ?? [box.center],
    )
    const min = { x: Infinity, y: Infinity, z: Infinity },
      max = { x: -Infinity, y: -Infinity, z: -Infinity }
    for (const p of points)
      for (const axis of ["x", "y", "z"] as const) {
        min[axis] = Math.min(min[axis], p[axis])
        max[axis] = Math.max(max[axis], p[axis])
      }
    const target = {
      x: (min.x + max.x) / 2,
      y: (min.y + max.y) / 2,
      z: (min.z + max.z) / 2,
    }
    const distance =
      Math.max(Math.hypot(max.x - min.x, max.y - min.y, max.z - min.z), 1) * 1.5
    camera = {
      ...camera,
      target,
      position: {
        x: target.x + distance * 0.5,
        y: target.y + distance * 0.7,
        z: target.z + distance * 0.5,
      },
      far: distance * 4,
    }
  }

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

  if (explosion && options.showExplosionLines !== false)
    boxes.push(...createExplosionLineBoxes(explosion.lines, boxes))

  const scene: Scene3D = {
    boxes,
    camera,
    lights,
  }
  return options.showErrors
    ? withCircuitJsonErrors(scene, inputCircuitJson)
    : scene
}
