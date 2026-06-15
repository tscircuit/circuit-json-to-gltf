import type { CircuitJson } from "circuit-json"
import { renderGLTFToPNGFromGLB } from "poppygl"
import {
  getBestCameraPosition,
  type CameraFitOptions,
} from "../lib/utils/camera-position"

export function renderGlbToPng(
  glb: ArrayBuffer,
  circuitJson: CircuitJson,
  extraOptions?: object,
  cameraFitOptions?: CameraFitOptions,
) {
  const cameraOptions = getBestCameraPosition(circuitJson, cameraFitOptions)
  return renderGLTFToPNGFromGLB(glb, { ...cameraOptions, ...extraOptions })
}
