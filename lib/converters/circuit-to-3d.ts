import { cju, findBoundsAndCenter } from "@tscircuit/circuit-json-util"
import type {
  CadComponent,
  CircuitJson,
  PcbCutout,
  PcbHole,
  PcbPanel,
  PcbPlatedHole,
} from "circuit-json"
import { loadFootprinterModel } from "../loaders/footprinter"
import { loadGLB } from "../loaders/glb"
import { loadGLTF } from "../loaders/gltf"
import { loadJscadPlan } from "../loaders/jscad-plan"
import { loadOBJ } from "../loaders/obj"
import { loadSTEP } from "../loaders/step"
import { loadSTL } from "../loaders/stl"
import type {
  Box3D,
  Camera3D,
  CircuitTo3DOptions,
  Light3D,
  Point3,
  Scene3D,
} from "../types"
import {
  fitMeshToCadBounds,
  getMeshOrigin,
  getMeshWithBoardNormalTransform,
} from "../utils/cad-mesh-placement"
import { getDefaultModelTransform } from "../utils/get-default-model-transform"
import { COORDINATE_TRANSFORMS } from "../utils/coordinate-transform"
import {
  getBoundingBoxSize,
  scaleMesh,
  translateMesh,
} from "../utils/mesh-scale"
import { filterCutoutsForBoard } from "../utils/pcb-board-cutouts"
import { createBoardMesh } from "../utils/pcb-board-geometry"
import { createPanelMesh } from "../utils/pcb-panel-geometry"
import {
  colorToCssString,
  getBoardColorPalette,
} from "../utils/board-color-palette"
import { renderBoardTextures } from "./board-renderer"

const DEFAULT_BOARD_THICKNESS = 1.6 // mm
const DEFAULT_COMPONENT_HEIGHT = 2 // mm
const COPPER_THICKNESS = 0.035
const FAUX_BOARD_MARGIN = 2
const DEFAULT_FAUX_BOARD_SIZE = 10

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

function convertCadSizeToSceneSize(size: { x: number; y: number; z: number }): {
  x: number
  y: number
  z: number
} {
  return {
    x: size.x,
    y: size.y,
    z: size.z,
  }
}

export async function convertCircuitJsonTo3D(
  circuitJson: CircuitJson,
  options: CircuitTo3DOptions = {},
): Promise<Scene3D> {
  const {
    pcbColor = "rgba(0,140,0,0.8)",
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

  const db: any = cju(circuitJson)
  const boxes: Box3D[] = []

  const palette = getBoardColorPalette(circuitJson, {
    solderMaskColor:
      options.pcbColor !== undefined
        ? colorToCssString(options.pcbColor)
        : undefined,
    silkscreenColor,
  })
  const resolvedPcbColor =
    options.pcbColor ?? palette.backgroundColor ?? pcbColor
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
  const pcbBoard = db.pcb_board?.list?.()[0]
  const pcbComponents = db.pcb_component?.list?.() ?? []

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

    const panelMesh = createPanelMesh(pcbPanel, {
      thickness: effectiveBoardThickness,
      holes: pcbHoles,
      platedHoles: pcbPlatedHoles,
      cutouts: panelCutouts,
      drillQuality: boardDrillQuality,
    })

    const meshWidth = panelMesh.boundingBox.max.x - panelMesh.boundingBox.min.x
    const meshHeight = panelMesh.boundingBox.max.y - panelMesh.boundingBox.min.y

    const panelBox: Box3D = {
      center: {
        x: pcbPanel.center.x,
        y: pcbPanel.center.y,
        z: 0,
      },
      size: {
        x: Number.isFinite(meshWidth) ? meshWidth : pcbPanel.width,
        y: Number.isFinite(meshHeight) ? meshHeight : pcbPanel.height,
        z: effectiveBoardThickness,
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
  } else if (pcbBoard) {
    // Create the main PCB board box
    const pcbHoles = (db.pcb_hole?.list?.() ?? []) as PcbHole[]
    const pcbPlatedHoles = (db.pcb_plated_hole?.list?.() ??
      []) as PcbPlatedHole[]
    const pcbCutouts = (db.pcb_cutout?.list?.() ?? []) as PcbCutout[]
    const boardCutouts = filterCutoutsForBoard(pcbCutouts, pcbBoard)

    const boardMesh = createBoardMesh(pcbBoard, {
      thickness: effectiveBoardThickness,
      holes: pcbHoles,
      platedHoles: pcbPlatedHoles,
      cutouts: boardCutouts,
      drillQuality: boardDrillQuality,
    })

    const meshWidth = boardMesh.boundingBox.max.x - boardMesh.boundingBox.min.x
    const meshHeight = boardMesh.boundingBox.max.y - boardMesh.boundingBox.min.y

    const boardBox: Box3D = {
      center: {
        x: pcbBoard.center.x,
        y: pcbBoard.center.y,
        z: 0,
      },
      size: {
        x: Number.isFinite(meshWidth) ? meshWidth : pcbBoard.width,
        y: Number.isFinite(meshHeight) ? meshHeight : pcbBoard.height,
        z: effectiveBoardThickness,
      },
      mesh: boardMesh,
      color: resolvedPcbColor,
      sideColor: resolvedBoardSideColor,
    }

    // Render board textures if requested and resolution > 0
    if (shouldRenderTextures && textureResolution > 0) {
      try {
        const textures = await renderBoardTextures(circuitJson, {
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

    boxes.push(boardBox)
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
        y: fauxHeight,
        z: effectiveBoardThickness,
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
    const {
      model_stl_url,
      model_obj_url,
      model_glb_url,
      model_gltf_url,
      model_jscad,
      model_step_url,
    } = cad

    const hasFootprinterModel = Boolean(
      cad.footprinter_string &&
        !model_stl_url &&
        !model_obj_url &&
        !model_glb_url &&
        !model_gltf_url &&
        !model_jscad &&
        !model_step_url,
    )

    if (cad.show_as_bounding_box) {
      pcbComponentIdsWithBoundingBox.add(cad.pcb_component_id)
    }

    const hasModelSource = Boolean(
      model_stl_url ||
        model_obj_url ||
        model_glb_url ||
        model_gltf_url ||
        model_jscad ||
        model_step_url ||
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
      ? convertCadSizeToSceneSize({
          x: cad.size.x * modelScaleFactor,
          y: cad.size.y * modelScaleFactor,
          z: cad.size.z * modelScaleFactor,
        })
      : {
          x: pcbComponent?.width ?? 2,
          y: pcbComponent?.height ?? 2,
          z: defaultComponentHeight,
        }

    // Determine position
    const center = cad.position
      ? {
          x: cad.position.x,
          y: cad.position.y,
          z: cad.position.z,
        }
      : {
          x: pcbComponent?.center.x ?? 0,
          y: pcbComponent?.center.y ?? 0,
          z: isBottomLayer
            ? -(effectiveBoardThickness / 2 + size.z / 2)
            : effectiveBoardThickness / 2 + size.z / 2,
        }

    const meshType = model_stl_url
      ? "stl"
      : model_obj_url
        ? "obj"
        : model_glb_url
          ? "glb"
          : model_gltf_url
            ? "gltf"
            : model_step_url
              ? "step"
              : hasFootprinterModel
                ? "glb"
                : undefined
    const sourceComponent = db.source_component.get(cad.source_component_id)
    const box: Box3D = {
      center,
      size,
      isTranslucent: cad.show_as_translucent_model,
      showHiddenEdges: (cad as CadComponent & { show_hidden_edges?: boolean })
        .show_hidden_edges,
      label: sourceComponent?.name,
    }

    if (
      model_stl_url ||
      model_obj_url ||
      model_glb_url ||
      model_gltf_url ||
      model_step_url
    ) {
      box.meshUrl =
        model_stl_url ||
        model_obj_url ||
        model_glb_url ||
        model_gltf_url ||
        model_step_url
      box.meshType = meshType
    }

    // Add rotation if specified
    if (cad.rotation) {
      box.rotation = convertRotationFromCadRotation(cad.rotation)
    } else if (isBottomLayer) {
      // If no rotation specified but component is on bottom, flip it
      if (model_glb_url || model_gltf_url || hasFootprinterModel) {
        box.rotation = convertRotationFromCadRotation({
          x: 0,
          y: 180, // Preserve the GLB fallback, now expressed in project Y.
          z: 0,
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
    // Make the loader mapping explicit so native normals and origins share it.
    // Different model formats use different coordinate conventions:
    // - OBJ models typically have Z-up with origin at the bottom
    // - STL models vary widely
    // - GLB/GLTF have their own conventions
    const usingGlbCoordinates = Boolean(model_glb_url || model_gltf_url)
    const usingObjFormat = Boolean(model_obj_url)
    const usingStepFormat = Boolean(model_step_url)

    let defaultTransform = getDefaultModelTransform(cad, {
      coordinateTransform,
      usingGlbCoordinates,
      usingObjFormat,
      usingStepFormat,
      hasFootprinterModel,
    })

    if (model_stl_url) {
      box.mesh = await loadSTL({
        url: model_stl_url,
        transform: defaultTransform,
        projectBaseUrl,
        authHeaders,
      })
    } else if (model_obj_url) {
      box.mesh = await loadOBJ({
        url: model_obj_url,
        transform: defaultTransform,
        projectBaseUrl,
        authHeaders,
      })
    } else if (model_glb_url) {
      try {
        box.mesh = await loadGLB({
          url: model_glb_url,
          transform: defaultTransform,
          projectBaseUrl,
          authHeaders,
        })
      } catch (err) {
        console.error(`Failed to load GLB from ${model_glb_url}:`, err)
      }
    } else if (model_gltf_url) {
      box.mesh = await loadGLTF({
        url: model_gltf_url,
        transform: defaultTransform,
        projectBaseUrl,
        authHeaders,
      })
    } else if (model_step_url) {
      try {
        box.mesh = await loadSTEP({
          url: model_step_url,
          transform: defaultTransform,
          projectBaseUrl,
          authHeaders,
        })
      } catch (err) {
        console.error(`Failed to load STEP from ${model_step_url}:`, err)
      }
    } else if (model_jscad) {
      box.mesh = loadJscadPlan(model_jscad)
      // JSCAD stays in its native project axes, regardless of loader overrides.
      defaultTransform = COORDINATE_TRANSFORMS.IDENTITY
      box.color = componentColor
    } else if (hasFootprinterModel && cad.footprinter_string) {
      box.mesh = await loadFootprinterModel(
        cad.footprinter_string,
        defaultTransform,
      )
    }

    if (box.mesh && modelScaleFactor !== 1) {
      box.mesh = scaleMesh(box.mesh, modelScaleFactor)
    }

    if (box.mesh) {
      box.mesh = getMeshWithBoardNormalTransform(
        box.mesh,
        cad.model_board_normal_direction,
        defaultTransform,
      )

      const meshOrigin = getMeshOrigin(cad, box.mesh, {
        loaderTransform: defaultTransform,
        modelBoardNormalDirection: cad.model_board_normal_direction,
      })
      if (meshOrigin) {
        box.mesh = translateMesh(box.mesh, {
          x: -meshOrigin.x,
          y: -meshOrigin.y,
          z: -meshOrigin.z,
        })
      }

      if (cad.size) {
        box.mesh = fitMeshToCadBounds(
          box.mesh,
          size,
          cad.model_object_fit ?? "contain_within_bounds",
        )
      }

      box.size = getBoundingBoxSize(box.mesh.boundingBox)
    }

    // Skip empty generated footprint models unless debug boxes are requested.
    if (!box.mesh) {
      if (hasFootprinterModel && !showBoundingBoxes) continue
      box.color = componentColor
    }

    boxes.push(box)
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

      boxes.push({
        center: {
          x: component.center.x,
          y: component.center.y,
          z: isBottomLayer
            ? -(effectiveBoardThickness + compHeight / 2)
            : effectiveBoardThickness / 2 + compHeight / 2,
        },
        size: {
          x: component.width,
          y: component.height,
          z: compHeight,
        },
        color: componentColor,
        label: sourceComponent?.name ?? "?",
        labelColor: "white",
      })
    }
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
        y: pcbBoard.center.y + cameraDistance * 0.5,
        z: cameraDistance * 0.7,
      },
      target: {
        x: pcbBoard.center.x,
        y: pcbBoard.center.y,
        z: 0,
      },
      up: { x: 0, y: 0, z: 1 },
      fov: 50,
      near: 0.1,
      far: cameraDistance * 4,
    }
  } else {
    const hasBoxes = boxes.length > 0

    if (hasBoxes) {
      let minX = Infinity
      let minY = Infinity
      let maxX = -Infinity
      let maxY = -Infinity

      for (const box of boxes) {
        const halfX = (box.size?.x ?? 0) / 2
        const halfY = (box.size?.y ?? 0) / 2

        minX = Math.min(minX, box.center.x - halfX)
        maxX = Math.max(maxX, box.center.x + halfX)
        minY = Math.min(minY, box.center.y - halfY)
        maxY = Math.max(maxY, box.center.y + halfY)
      }

      const width = Math.max(maxX - minX, 1)
      const height = Math.max(maxY - minY, 1)
      const diagonal = Math.sqrt(width * width + height * height)
      const distance = diagonal * 1.5
      const centerX = (minX + maxX) / 2
      const centerY = (minY + maxY) / 2

      camera = {
        position: {
          x: centerX + distance * 0.5,
          y: centerY + distance * 0.5,
          z: distance * 0.7,
        },
        target: { x: centerX, y: centerY, z: 0 },
        up: { x: 0, y: 0, z: 1 },
        fov: 50,
        near: 0.1,
        far: distance * 4,
      }
    } else {
      camera = {
        position: { x: 30, y: 25, z: 30 },
        target: { x: 0, y: 0, z: 0 },
        up: { x: 0, y: 0, z: 1 },
        fov: 50,
        near: 0.1,
        far: 120,
      }
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

  return {
    boxes,
    camera,
    lights,
  }
}
