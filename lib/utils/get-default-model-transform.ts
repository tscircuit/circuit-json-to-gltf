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
  cad: CadComponent,
  options: GetDefaultModelTransformOptions,
): CoordinateTransformConfig | undefined {
  if (options.coordinateTransform) {
    return options.coordinateTransform
  }

  const modelBoardNormalDirection = cad.model_board_normal_direction

  if (
    modelBoardNormalDirection === "x-" ||
    modelBoardNormalDirection === "y+" ||
    modelBoardNormalDirection === "y-"
  ) {
    return COORDINATE_TRANSFORMS.IDENTITY
  }

  if (options.usingGlbCoordinates) {
    return undefined
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
