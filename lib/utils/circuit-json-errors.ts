import type { CircuitJsonWithPcbFlex, Scene3D } from "../types"

/** Carry full Circuit JSON error messages independently of scene geometry.
 * Errors without PCB positions remain available to screen overlay renderers.
 * The original scene and Circuit JSON are never mutated.
 */
export function withCircuitJsonErrors(
  scene: Scene3D,
  circuitJson: CircuitJsonWithPcbFlex,
): Scene3D {
  const errorMessages = circuitJson.flatMap((element) =>
    "error_type" in element &&
    typeof element.error_type === "string" &&
    "message" in element &&
    typeof element.message === "string"
      ? [element.message]
      : [],
  )
  return errorMessages.length ? { ...scene, errorMessages } : scene
}
