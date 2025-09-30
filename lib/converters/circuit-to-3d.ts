import { type CircuitJson, type CadComponent } from "circuit-json"
import { cju } from "@tscircuit/circuit-json-util"
import type {
  Box3D,
  Scene3D,
  CircuitTo3DOptions,
  Camera3D,
  Light3D,
  ExternalModelInstance,
  LoadedGLTFAsset,
} from "../types"
import { loadSTL } from "../loaders/stl"
import { loadOBJ } from "../loaders/obj"
import { loadGLTF } from "../loaders/gltf"
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

function extractGltfUrl(cad: CadComponent): string | undefined {
  const directUrl =
    (cad as unknown as { model_gltf_url?: string; model_glb_url?: string })
      .model_gltf_url ??
    (cad as unknown as { model_glb_url?: string }).model_glb_url

  if (typeof directUrl === "string" && directUrl.length > 0) {
    return directUrl
  }

  return undefined
}

function extractScale(
  cad: CadComponent,
): { x: number; y: number; z: number } | undefined {
  const raw = (cad as any).scale ?? (cad as any).scaling
  if (raw == null) return undefined

  if (typeof raw === "number") {
    if (raw === 1) return undefined
    return { x: raw, y: raw, z: raw }
  }

  if (typeof raw === "object") {
    const x = typeof (raw as any).x === "number" ? (raw as any).x : 1
    const y = typeof (raw as any).y === "number" ? (raw as any).y : 1
    const z = typeof (raw as any).z === "number" ? (raw as any).z : 1
    if (x === 1 && y === 1 && z === 1) return undefined
    return { x, y, z }
  }

  return undefined
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
    includeModels = true,
    modelCache,
  } = options

  const db: any = cju(circuitJson)
  const boxes: Box3D[] = []
  const externalModels: ExternalModelInstance[] = []

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

  const defaultTransform =
    coordinateTransform ?? COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP_USB_FIX

  for (const cad of cadComponents) {
    const gltfUrl = includeModels ? extractGltfUrl(cad) : undefined
    const { model_stl_url, model_obj_url } = cad
    if (!model_stl_url && !model_obj_url && !gltfUrl) continue

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

    const rotation = cad.rotation
      ? convertRotationFromCadRotation(cad.rotation)
      : undefined

    if (gltfUrl) {
      try {
        const cached = modelCache?.get(gltfUrl) as LoadedGLTFAsset | undefined
        const asset = cached ?? (await loadGLTF(gltfUrl))
        modelCache?.set(gltfUrl, asset)

        externalModels.push({
          id: cad.cad_component_id ?? gltfUrl,
          url: gltfUrl,
          asset,
          center,
          rotation,
          scale: extractScale(cad),
          coordinateTransform: defaultTransform,
          label: pcbComponent?.source_component_id,
        })
        continue
      } catch (error) {
        console.warn(`Failed to load GLTF model from ${gltfUrl}:`, error)
      }
    }

    const box: Box3D = {
      center,
      size,
      color: componentColor,
      meshUrl: model_stl_url || model_obj_url,
      meshType: model_stl_url ? "stl" : "obj",
    }

    if (rotation) {
      box.rotation = rotation
    }

    try {
      if (model_stl_url) {
        box.mesh = await loadSTL(model_stl_url, defaultTransform)
      } else if (model_obj_url) {
        box.mesh = await loadOBJ(model_obj_url, defaultTransform)
      }
    } catch (error) {
      console.warn(`Failed to load 3D model: ${error}`)
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

  const scene: Scene3D = {
    boxes,
    camera,
    lights,
  }

  if (externalModels.length > 0) {
    scene.externalModels = externalModels
  }

  return scene
}
