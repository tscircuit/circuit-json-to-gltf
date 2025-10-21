import {
  type CircuitJson,
  type CadComponent,
  type PcbHole,
  type PCBPlatedHole,
} from "circuit-json"
import { cju } from "@tscircuit/circuit-json-util"
import type {
  Box3D,
  Scene3D,
  CircuitTo3DOptions,
  Camera3D,
  Light3D,
} from "../types"
import { loadSTL } from "../loaders/stl"
import { loadOBJ } from "../loaders/obj"
import { loadGLB } from "../loaders/glb"
import { loadGLTF } from "../loaders/gltf"
import { loadFootprinterModel } from "../loaders/footprinter"
import { renderBoardTextures } from "./board-renderer"
import { COORDINATE_TRANSFORMS } from "../utils/coordinate-transform"
import { scaleMesh } from "../utils/mesh-scale"
import { createBoardMesh } from "../utils/pcb-board-geometry"

const DEFAULT_BOARD_THICKNESS = 1.6 // mm
const DEFAULT_COMPONENT_HEIGHT = 2 // mm

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
    boardThickness = DEFAULT_BOARD_THICKNESS,
    defaultComponentHeight = DEFAULT_COMPONENT_HEIGHT,
    renderBoardTextures: shouldRenderTextures = true,
    textureResolution = 1024,
    coordinateTransform,
    showBoundingBoxes = true,
  } = options

  const db: any = cju(circuitJson)
  const boxes: Box3D[] = []

  // Get PCB board (optional)
  const pcbBoard = db.pcb_board?.list?.()[0]
  const effectiveBoardThickness = pcbBoard?.thickness ?? boardThickness

  if (pcbBoard) {
    // Create the main PCB board box
    const pcbHoles = (db.pcb_hole?.list?.() ?? []) as PcbHole[]
    const pcbPlatedHoles = (db.pcb_plated_hole?.list?.() ??
      []) as PCBPlatedHole[]

    const boardMesh = createBoardMesh(pcbBoard, {
      thickness: effectiveBoardThickness,
      holes: pcbHoles,
      platedHoles: pcbPlatedHoles,
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
        x: Number.isFinite(meshWidth) ? meshWidth : pcbBoard.width,
        y: effectiveBoardThickness,
        z: Number.isFinite(meshHeight) ? meshHeight : pcbBoard.height,
      },
      mesh: boardMesh,
      color: pcbColor,
    }

    // Render board textures if requested and resolution > 0
    if (shouldRenderTextures && textureResolution > 0) {
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
        // If texture rendering fails, use the fallback color
        boardBox.color = pcbColor
      }
    } else {
      // No textures requested, use solid color
      boardBox.color = pcbColor
    }

    boxes.push(boardBox)
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
            ? -(effectiveBoardThickness / 2 + size.y / 2)
            : effectiveBoardThickness / 2 + size.y / 2,
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
      box.meshType = meshType as any
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
