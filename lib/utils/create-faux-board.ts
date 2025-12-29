import type { Box3D, Color } from "../types"
import type { PcbComponent } from "circuit-json"
import { getBoundsOfPcbElements } from "@tscircuit/circuit-json-util"

interface FauxBoardParams {
  pcbComponents: PcbComponent[]
  boardThickness: number
  pcbColor: Color
}

/**
 * Build a translucent synthetic board box from component extents.
 * Returns undefined when no components are present.
 */
export const createFauxBoard = ({
  pcbComponents,
  boardThickness,
  pcbColor,
}: FauxBoardParams): Box3D | undefined => {
  if (!pcbComponents || pcbComponents.length === 0) return undefined

  const { minX, minY, maxX, maxY } = getBoundsOfPcbElements(pcbComponents)

  const paddingX = (maxX - minX) * 0.1
  const paddingY = (maxY - minY) * 0.1

  const paddedMinX = minX - paddingX
  const paddedMinY = minY - paddingY
  const paddedMaxX = maxX + paddingX
  const paddedMaxY = maxY + paddingY

  const width = Math.max(paddedMaxX - paddedMinX, 20)
  const height = Math.max(paddedMaxY - paddedMinY, 20)
  const centerX = (paddedMinX + paddedMaxX) / 2
  const centerY = (paddedMinY + paddedMaxY) / 2

  return {
    center: {
      x: centerX,
      y: -boardThickness,
      z: centerY,
    },
    size: {
      x: width,
      y: boardThickness,
      z: height,
    },
    color: pcbColor,
    isTranslucent: true,
  }
}
