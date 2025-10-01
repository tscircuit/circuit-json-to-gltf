import type { CircuitJson } from "circuit-json"

/**
 * Calculate optimal camera position for PCB viewing based on circuit dimensions
 */
export function getBestCameraPosition(circuitJson: CircuitJson): {
  camPos: readonly [number, number, number]
  lookAt: readonly [number, number, number]
} {
  // Find PCB board to get dimensions
  const board = circuitJson.find((item) => item.type === "pcb_board")

  if (!board || board.type !== "pcb_board") {
    // Default fallback for circuits without explicit board
    return {
      camPos: [30, 30, 25] as const,
      lookAt: [0, 0, 0] as const,
    }
  }

  const { width, height, center } = board

  // Validate required properties
  if (!width || !height || !center) {
    return {
      camPos: [30, 30, 25] as const,
      lookAt: [0, 0, 0] as const,
    }
  }

  // Calculate camera distance based on board size
  const maxDimension = Math.max(width, height)

  // Use completely deterministic integer values to ensure identical rendering
  // across all environments (local, CI, different Node versions, etc.)
  const baseDistance = Math.round(maxDimension * 0.8)

  // Force integer camera positions for absolute consistency
  const camX = Math.round(baseDistance * 0.7)
  const camY = Math.round(baseDistance * 1.2)
  const camZ = Math.round(baseDistance * 0.8)

  // Also round the lookAt position for consistency
  const lookAtX = Math.round(center.x)
  const lookAtY = Math.round(center.y)

  return {
    camPos: [camX, camY, camZ] as const,
    lookAt: [lookAtX, lookAtY, 0] as const,
  }
}
