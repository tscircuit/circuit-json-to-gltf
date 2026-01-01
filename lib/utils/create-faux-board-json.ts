import type { CircuitJson, PcbBoard, CadComponent } from "circuit-json"
import { getBoundsOfPcbElements } from "@tscircuit/circuit-json-util"
import { getJscadModelForFootprint } from "jscad-electronics/vanilla"
import * as jscadModeling from "@jscad/modeling"

interface FauxBoardOptions {
  circuitJson: CircuitJson
  cadComponents: CadComponent[]
  thickness?: number // default: 1.6
  padding?: number // default: 2.0
}

export async function injectFauxBoard({
  circuitJson,
  cadComponents,
  thickness = 1.6,
  padding = 2.0,
}: FauxBoardOptions): Promise<CircuitJson> {
  // 1. Calculate comprehensive bounds including footprints
  const bounds = await calculateComponentBounds(circuitJson, cadComponents)

  // 2. Apply padding
  const paddedBounds = {
    minX: bounds.minX - padding,
    minY: bounds.minY - padding,
    maxX: bounds.maxX + padding,
    maxY: bounds.maxY + padding,
  }

  // 3. Create faux board element
  const fauxBoard: PcbBoard = {
    type: "pcb_board",
    pcb_board_id: "faux_board_1",
    center: {
      x: (paddedBounds.minX + paddedBounds.maxX) / 2,
      y: (paddedBounds.minY + paddedBounds.maxY) / 2,
    },
    width: paddedBounds.maxX - paddedBounds.minX,
    height: paddedBounds.maxY - paddedBounds.minY,
    thickness,
    // Mark as faux for special processing
    _isFaux: true,
  } as any

  // 4. Inject into circuit JSON
  return [...circuitJson, fauxBoard]
}

async function calculateComponentBounds(
  circuitJson: CircuitJson,
  cadComponents: CadComponent[],
) {
  // Get PCB components from circuit JSON
  const pcbComponents = circuitJson.filter(
    (el): el is any => el.type === "pcb_component",
  )

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  // Get PCB component bounds (existing logic)
  if (pcbComponents.length > 0) {
    const pcbBounds = getBoundsOfPcbElements(pcbComponents)
    minX = Math.min(minX, pcbBounds.minX)
    minY = Math.min(minY, pcbBounds.minY)
    maxX = Math.max(maxX, pcbBounds.maxX)
    maxY = Math.max(maxY, pcbBounds.maxY)
  }

  // Add footprint bounds for each CAD component
  for (const cad of cadComponents) {
    if (cad.footprinter_string) {
      try {
        const footprintBounds = await getFootprintBounds(cad.footprinter_string)

        // Get component position (from PCB component or CAD component)
        const componentX = (cad as any).pcbX || 0
        const componentY = (cad as any).pcbY || 0

        // Transform bounds to component position and expand overall bounds
        const transformedMinX = footprintBounds.minX + componentX
        const transformedMinY = footprintBounds.minY + componentY
        const transformedMaxX = footprintBounds.maxX + componentX
        const transformedMaxY = footprintBounds.maxY + componentY

        minX = Math.min(minX, transformedMinX)
        minY = Math.min(minY, transformedMinY)
        maxX = Math.max(maxX, transformedMaxX)
        maxY = Math.max(maxY, transformedMaxY)
      } catch (error) {
        console.warn(
          `Failed to calculate bounds for footprint ${cad.footprinter_string}`,
        )
      }
    }
  }

  return { minX, minY, maxX, maxY }
}

async function getFootprintBounds(footprintString: string) {
  const model = getJscadModelForFootprint(footprintString, jscadModeling)
  if (!model?.geometries?.length) {
    throw new Error(`No geometries found for footprint ${footprintString}`)
  }

  const bounds = jscadModeling.measurements.measureBoundingBox(model)
  if (!bounds || bounds.length < 2) {
    throw new Error(`Invalid bounds for footprint ${footprintString}`)
  }

  const [minBounds, maxBounds] = bounds
  return {
    minX: minBounds[0],
    minY: minBounds[1],
    maxX: maxBounds[0],
    maxY: maxBounds[1],
  }
}
