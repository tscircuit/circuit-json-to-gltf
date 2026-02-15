import { findBoundsAndCenter } from "@tscircuit/circuit-json-util"
import type { CircuitJson } from "circuit-json"
import { renderBoardTextures } from "../converters/board-renderer"
import type { Box3D, Color } from "../types"

const FAUX_BOARD_MARGIN = 2
const DEFAULT_FAUX_BOARD_SIZE = 10

export interface CreateFauxBoardOptions {
  effectiveBoardThickness: number
  pcbColor: Color
  shouldRenderTextures: boolean
  textureResolution: number
}

export async function createFauxBoard(
  circuitJson: CircuitJson,
  pcbComponents: any[],
  options: CreateFauxBoardOptions,
): Promise<Box3D> {
  const {
    effectiveBoardThickness,
    pcbColor,
    shouldRenderTextures,
    textureResolution,
  } = options

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
    color: pcbColor,
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

      const textures = await renderBoardTextures(
        fauxBoardCircuitJson,
        textureResolution,
      )

      fauxBoardBox.texture = {
        top: textures.top,
        bottom: textures.bottom,
      }
    } catch (error) {
      console.warn("Failed to render faux board textures:", error)
      fauxBoardBox.color = pcbColor
    }
  }

  return fauxBoardBox
}
