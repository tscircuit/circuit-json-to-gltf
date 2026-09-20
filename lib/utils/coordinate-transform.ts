import type { CoordinateTransformConfig, Point3, Triangle } from "../types"
import * as vec3 from "@jscad/modeling/src/maths/vec3"

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
  const axes = [
    { x: 1, y: 0, z: 0 },
    { x: 0, y: 1, z: 0 },
    { x: 0, y: 0, z: 1 },
  ].map((axis) => {
    const point = applyCoordinateTransform(axis, config)
    return vec3.fromValues(point.x, point.y, point.z)
  })
  const cofactors = [
    vec3.cross(vec3.create(), axes[1]!, axes[2]!),
    vec3.cross(vec3.create(), axes[2]!, axes[0]!),
    vec3.cross(vec3.create(), axes[0]!, axes[1]!),
  ]
  const determinant = vec3.dot(axes[0]!, cofactors[0]!)
  if (determinant === 0) {
    throw new Error("Coordinate transform must have an invertible basis")
  }
  return triangles.map((triangle): Triangle => {
    const vertices: [Point3, Point3, Point3] = [
      applyCoordinateTransform(triangle.vertices[0], config),
      applyCoordinateTransform(triangle.vertices[1], config),
      applyCoordinateTransform(triangle.vertices[2], config),
    ]
    if (determinant < 0) {
      ;[vertices[1], vertices[2]] = [vertices[2], vertices[1]]
    }
    // Cofactor columns / determinant are the inverse-transpose basis.
    const normal = vec3.create()
    for (const [i, value] of [
      triangle.normal.x,
      triangle.normal.y,
      triangle.normal.z,
    ].entries()) {
      vec3.add(
        normal,
        normal,
        vec3.scale(vec3.create(), cofactors[i]!, value / determinant),
      )
    }
    vec3.normalize(normal, normal)
    return {
      ...triangle,
      vertices,
      normal: { x: normal[0], y: normal[1], z: normal[2] },
    }
  })
}

// Predefined transformation configs for common model orientations
export const COORDINATE_TRANSFORMS = {
  // Preserve the exporter's historical STL model orientation in project space:
  // undo the old intermediate Y/Z swap, yielding a proper 180-degree X rotation.
  STL_TO_CANONICAL: {
    axisMapping: { x: "x", y: "-y", z: "-z" },
  } as CoordinateTransformConfig,
  // Legacy opt-in Y/Z swap. Scene3D is now canonical Z-up; loaders no longer
  // use this reflection. Retained for callers explicitly requesting it.
  CIRCUIT_Z_UP_TO_SCENE_Y_UP: {
    axisMapping: { x: "x", y: "z", z: "y" },
  } as CoordinateTransformConfig,

  // Legacy opt-in Z-up to Y-up rotation.
  Z_UP_TO_Y_UP: {
    axisMapping: { x: "x", y: "-z", z: "y" },
  } as CoordinateTransformConfig,

  // For models where Z+ should point "out of top of board"
  Z_OUT_OF_TOP: {
    axisMapping: { x: "x", y: "z", z: "-y" },
  } as CoordinateTransformConfig,

  // Legacy opt-in STEP axis swap; canonical STEP loading uses identity.
  STEP_INVERTED: {
    axisMapping: { x: "x", y: "z", z: "y" },
  } as CoordinateTransformConfig,

  // Legacy opt-in flip in the old intermediate frame.
  USB_PORT_FIX: {
    flipY: -1,
  } as CoordinateTransformConfig,

  // Legacy combined mapping in the old intermediate Y-up frame.
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
  // Retained opt-in mapping, not the native footprinter loader default.
  FOOTPRINTER_MODEL_TRANSFORM: {
    axisMapping: { x: "x", y: "-z", z: "y" },
    flipX: -1,
    rotation: { x: 180, y: 180 },
  } as CoordinateTransformConfig,

  // Legacy opt-in OBJ axis swap; canonical OBJ loading uses identity.
  OBJ_Z_UP_TO_Y_UP: {
    axisMapping: { x: "x", y: "z", z: "y" },
  } as CoordinateTransformConfig,
} as const
