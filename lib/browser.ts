// Browser-safe exports that don't include Node.js dependencies
export type {
  ConversionOptions,
  Point3,
  Size3,
  Triangle,
  BoundingBox,
  STLMesh,
  OBJMesh,
  OBJMaterial,
  Color,
  Box3D,
  Scene3D,
  Camera3D,
  Light3D,
  GLTFExportOptions,
  CircuitTo3DOptions,
  BoardRenderOptions,
} from "./types"

export { loadSTL, clearSTLCache } from "./loaders/stl"
export { loadOBJ, clearOBJCache } from "./loaders/obj"

// Browser-safe version of circuit to 3D conversion (without texture rendering)
import type { CircuitJson } from "circuit-json"
import type { ConversionOptions, Scene3D } from "./types"
import { cju } from "@tscircuit/circuit-json-util"
import { convertSceneToGLTF } from "./converters/scene-to-gltf"

const DEFAULT_BOARD_THICKNESS = 1.6
const DEFAULT_COMPONENT_HEIGHT = 2

export async function convertCircuitJsonTo3D(
  circuitJson: CircuitJson,
  options: any = {},
): Promise<Scene3D> {
  const {
    pcbColor = "rgba(0,140,0,0.8)",
    componentColor = "rgba(128,128,128,0.5)",
    boardThickness = DEFAULT_BOARD_THICKNESS,
    defaultComponentHeight = DEFAULT_COMPONENT_HEIGHT,
  } = options

  const db = cju(circuitJson)
  const boxes: any[] = []

  // Get PCB board
  const pcbBoard = db.pcb_board!.list()[0]
  if (!pcbBoard) {
    throw new Error("No pcb_board found in circuit JSON")
  }

  // Create the main PCB board box (without textures in browser)
  boxes.push({
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
    color: pcbColor,
  })

  // Add generic boxes for components
  for (const component of db.pcb_component!.list()) {
    const sourceComponent = db.source_component!.get(
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

  // Create a default camera
  const boardDiagonal = Math.sqrt(
    pcbBoard.width * pcbBoard.width + pcbBoard.height * pcbBoard.height,
  )
  const cameraDistance = boardDiagonal * 1.5

  const camera = {
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
  const lights = [
    {
      type: "ambient" as const,
      color: "white",
      intensity: 0.5,
    },
    {
      type: "directional" as const,
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

export async function convertCircuitJsonToGltf(
  circuitJson: CircuitJson,
  options: ConversionOptions = {},
): Promise<ArrayBuffer | object> {
  const { format = "gltf" } = options

  // Convert circuit JSON to 3D scene (without textures in browser)
  const scene3D = await convertCircuitJsonTo3D(circuitJson, {
    renderBoardTextures: false,
  })

  // Convert 3D scene to GLTF
  const gltfOptions = {
    binary: format === "glb",
    embedImages: true,
    forceIndices: true,
  }

  const result = await convertSceneToGLTF(scene3D, gltfOptions)

  return result
}
