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
    return COORDINATE_TRANSFORMS.IDENTITY
  }
  if (options.hasFootprinterModel) {
    return COORDINATE_TRANSFORMS.IDENTITY
  }
  if (options.usingObjFormat) {
    return COORDINATE_TRANSFORMS.IDENTITY
  }
  if (options.usingStepFormat) {
    return COORDINATE_TRANSFORMS.IDENTITY
  }
  return COORDINATE_TRANSFORMS.STL_TO_CANONICAL
}
