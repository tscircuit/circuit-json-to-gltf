import type { CadComponent } from "circuit-json"
import type { CoordinateTransformConfig } from "../types"
import { COORDINATE_TRANSFORMS } from "./coordinate-transform"

export interface GetDefaultModelTransformOptions {
  coordinateTransform?: CoordinateTransformConfig
  usingGlbCoordinates: boolean
  usingObjFormat: boolean
  usingStepFormat: boolean
  hasFootprinterModel: boolean
}

export function getDefaultModelTransform(
  _cad: CadComponent,
  options: GetDefaultModelTransformOptions,
): CoordinateTransformConfig {
  if (options.coordinateTransform) {
    return options.coordinateTransform
  }

  if (options.usingGlbCoordinates) {
    // Match parseGLB's default Y/Z swap for both geometry and explicit origins.
    return COORDINATE_TRANSFORMS.CIRCUIT_Z_UP_TO_SCENE_Y_UP
  }
  if (options.hasFootprinterModel) {
    return COORDINATE_TRANSFORMS.FOOTPRINTER_MODEL_TRANSFORM
  }
  if (options.usingObjFormat) {
    return COORDINATE_TRANSFORMS.OBJ_Z_UP_TO_Y_UP
  }
  if (options.usingStepFormat) {
    return COORDINATE_TRANSFORMS.STEP_INVERTED
  }
  return COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP_USB_FIX
}
