import type { CoordinateTransformConfig } from "../types"
import { COORDINATE_TRANSFORMS } from "./coordinate-transform"

export interface GetDefaultModelTransformOptions {
  coordinateTransform?: CoordinateTransformConfig
  modelType: "stl" | "obj" | "glb" | "gltf" | "step" | "jscad" | "footprinter"
}

/** Asset -> canonical local normalization, not a renderer-space conversion. */
export function getDefaultModelTransform(
  options: GetDefaultModelTransformOptions,
): CoordinateTransformConfig {
  if (options.coordinateTransform) {
    return options.coordinateTransform
  }

  return options.modelType === "stl"
    ? COORDINATE_TRANSFORMS.STL_TO_CANONICAL
    : COORDINATE_TRANSFORMS.IDENTITY
}
