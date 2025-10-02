import {
  type CircuitJson,
  type CadComponent,
  any_circuit_element,
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
import { renderBoardTextures } from "./board-renderer"
import { COORDINATE_TRANSFORMS } from "../utils/coordinate-transform"

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
  } = options

  const db: any = cju(circuitJson)
  const boxes: Box3D[] = []

  // Get PCB board
  const pcbBoard = db.pcb_board.list()[0]
  if (!pcbBoard) {
    throw new Error("No pcb_board found in circuit JSON")
  }

  // Create the main PCB board box
  const boardBox: Box3D = {
    center: {
      x: pcbBoard.center.x,
      y: 0,
      z: pcbBoard.center.y,
    },
    size: {
      x: pcbBoard.width,
      y: boardThickness,
      z: pcbBoard.height,
    },
  }

  // Render board textures if requested and resolution > 0
  if (shouldRenderTextures && textureResolution > 0) {
    try {
      const textures = await renderBoardTextures(circuitJson, textureResolution)
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

  // Process CAD components (3D models)
  const cadComponents: CadComponent[] = (db.cad_component?.list?.() ??
    []) as any
  const pcbComponentIdsWith3D = new Set<string>()

  for (const cad of cadComponents) {
    let { model_stl_url, model_obj_url, model_glb_url } = cad

    const hasModelUrl = Boolean(model_stl_url || model_obj_url || model_glb_url)

    if (!hasModelUrl && cad.footprinter_string) {
      model_glb_url = `https://modelcdn.tscircuit.com/jscad_models/${cad.footprinter_string}.glb`
    }

    if (!model_stl_url && !model_obj_url && !model_glb_url) continue

    pcbComponentIdsWith3D.add(cad.pcb_component_id)

    // Get the associated PCB component
    const pcbComponent = db.pcb_component.get(cad.pcb_component_id)

    // Determine size
    const size = cad.size ?? {
      x: pcbComponent?.width ?? 2,
      y: defaultComponentHeight,
      z: pcbComponent?.height ?? 2,
    }

    // Determine position
    const center = cad.position
      ? { x: cad.position.x, y: cad.position.z, z: cad.position.y }
      : {
          x: pcbComponent?.center.x ?? 0,
          y: boardThickness / 2 + size.y / 2,
          z: pcbComponent?.center.y ?? 0,
        }

    const box: Box3D = {
      center,
      size,
      meshUrl: model_stl_url || model_obj_url || model_glb_url,
      meshType: model_stl_url ? "stl" : model_obj_url ? "obj" : "glb",
    }

    // Add rotation if specified
    if (cad.rotation) {
      box.rotation = convertRotationFromCadRotation(cad.rotation)
    }

    // Try to load the mesh with default coordinate transform if none specified
    // Note: GLB loader handles its own default Y/Z swap, so we pass through coordinateTransform
    // STL/OBJ files need Z-up to Y-up conversion
    const defaultTransform =
      coordinateTransform ??
      (model_glb_url
        ? undefined // GLB loader has its own default transform
        : COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP_USB_FIX)
    try {
      if (model_stl_url) {
        box.mesh = await loadSTL(model_stl_url, defaultTransform)
      } else if (model_obj_url) {
        box.mesh = await loadOBJ(model_obj_url, defaultTransform)
      } else if (model_glb_url) {
        box.mesh = await loadGLB(model_glb_url, defaultTransform)
      }
    } catch (error) {
      console.warn(`Failed to load 3D model: ${error}`)
    }

    // Only set color if mesh loading failed (fallback to simple box)
    if (!box.mesh) {
      box.color = componentColor
    }

    boxes.push(box)
  }

  // Add generic boxes for components without 3D models
  for (const component of db.pcb_component.list()) {
    if (pcbComponentIdsWith3D.has(component.pcb_component_id)) continue

    const sourceComponent = db.source_component.get(
      component.source_component_id,
    )
    const compHeight = Math.min(
      Math.min(component.width, component.height),
      defaultComponentHeight,
    )

    boxes.push({
      center: {
        x: component.center.x,
        y: boardThickness / 2 + compHeight / 2,
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

  // Create a default camera positioned to view the board
  const boardDiagonal = Math.sqrt(
    pcbBoard.width * pcbBoard.width + pcbBoard.height * pcbBoard.height,
  )
  const cameraDistance = boardDiagonal * 1.5

  const camera: Camera3D = {
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
