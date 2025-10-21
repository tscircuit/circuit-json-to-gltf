import type { Point3, CoordinateTransformConfig, Triangle } from "../types"

export function applyCoordinateTransform(
  point: Point3,
  config: CoordinateTransformConfig,
): Point3 {
  let { x, y, z } = point

  // Apply axis mapping first
  if (config.axisMapping) {
    const original = { x, y, z }

    if (config.axisMapping.x) {
      x = getAxisValue(original, config.axisMapping.x)
    }
    if (config.axisMapping.y) {
      y = getAxisValue(original, config.axisMapping.y)
    }
    if (config.axisMapping.z) {
      z = getAxisValue(original, config.axisMapping.z)
    }
  }

  // Apply simple flips
  x *= config.flipX ?? 1
  y *= config.flipY ?? 1
  z *= config.flipZ ?? 1

  // Apply rotation (simple rotation around each axis)
  if (config.rotation) {
    if (config.rotation.x) {
      const rad = (config.rotation.x * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      const newY = y * cos - z * sin
      const newZ = y * sin + z * cos
      y = newY
      z = newZ
    }

    if (config.rotation.y) {
      const rad = (config.rotation.y * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      const newX = x * cos + z * sin
      const newZ = -x * sin + z * cos
      x = newX
      z = newZ
    }

    if (config.rotation.z) {
      const rad = (config.rotation.z * Math.PI) / 180
      const cos = Math.cos(rad)
      const sin = Math.sin(rad)
      const newX = x * cos - y * sin
      const newY = x * sin + y * cos
      x = newX
      y = newY
    }
  }

  return { x, y, z }
}

function getAxisValue(original: Point3, mapping: string): number {
  switch (mapping) {
    case "x":
      return original.x
    case "y":
      return original.y
    case "z":
      return original.z
    case "-x":
      return -original.x
    case "-y":
      return -original.y
    case "-z":
      return -original.z
    default:
      return 0
  }
}

export function transformTriangles(
  triangles: Triangle[],
  config: CoordinateTransformConfig,
): Triangle[] {
  return triangles.map((triangle) => ({
    ...triangle,
    vertices: triangle.vertices.map((v) =>
      applyCoordinateTransform(v, config),
    ) as [Point3, Point3, Point3],
    normal: applyCoordinateTransform(triangle.normal, config),
  }))
}

// Predefined transformation configs for common model orientations
export const COORDINATE_TRANSFORMS = {
  // Default: Z-up to Y-up (current STL behavior)
  Z_UP_TO_Y_UP: {
    axisMapping: { x: "x", y: "-z", z: "y" },
  } as CoordinateTransformConfig,

  // For models where Z+ should point "out of top of board"
  Z_OUT_OF_TOP: {
    axisMapping: { x: "x", y: "z", z: "-y" },
  } as CoordinateTransformConfig,

  // USB port fix: flip to top of board (flip Y axis after Z-up conversion)
  USB_PORT_FIX: {
    flipY: -1,
  } as CoordinateTransformConfig,

  // Combined: Z-up to Y-up + USB port fix (flip Z to face outward)
  Z_UP_TO_Y_UP_USB_FIX: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    flipZ: -1,
  } as CoordinateTransformConfig,

  // No transformation
  IDENTITY: {} as CoordinateTransformConfig,

  // Additional test orientations for USB port
  TEST_ROTATE_X_90: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { x: 90 },
  } as CoordinateTransformConfig,

  TEST_ROTATE_X_270: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { x: 270 },
  } as CoordinateTransformConfig,

  TEST_ROTATE_Y_90: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { y: 90 },
  } as CoordinateTransformConfig,

  TEST_ROTATE_Y_270: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { y: 270 },
  } as CoordinateTransformConfig,

  TEST_ROTATE_Z_90: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { z: 90 },
  } as CoordinateTransformConfig,

  TEST_ROTATE_Z_270: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    rotation: { z: 270 },
  } as CoordinateTransformConfig,

  // Flip combinations
  TEST_FLIP_X: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    flipX: -1,
  } as CoordinateTransformConfig,

  TEST_FLIP_Z: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    flipZ: -1,
  } as CoordinateTransformConfig,
  FOOTPRINTER_MODEL_TRANSFORM: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    flipX: -1,
    rotation: { x: 180, y: 180 },
  } as CoordinateTransformConfig,

  // OBJ models: Z-up to Y-up with Y→Z (no negation to preserve winding order)
  OBJ_Z_UP_TO_Y_UP: {
    axisMapping: { x: "x", y: "z", z: "y" },
  } as CoordinateTransformConfig,
} as const
