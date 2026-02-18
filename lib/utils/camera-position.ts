import type { CircuitJson, PcbBoard, PcbPanel } from "circuit-json"

const DEFAULT_CAMERA_DIRECTION = [-0.7, 1.2, -0.8] as const

export interface CameraFitOptions {
  /**
   * Target-to-camera direction vector used for solved camera position.
   */
  direction?: readonly [number, number, number]
  /**
   * Vertical field of view in degrees.
   */
  fov?: number
  /**
   * Aspect ratio (width / height) used for horizontal fit calculations.
   */
  aspectRatio?: number
  /**
   * Focal length in millimeters. If provided with sensorHeight,
   * it is used instead of fov.
   */
  focalLength?: number
  /**
   * Sensor height in millimeters for focalLength->fov conversion.
   */
  sensorHeight?: number
}

function normalizeVector([x, y, z]: readonly [number, number, number]): [
  number,
  number,
  number,
] {
  const length = Math.hypot(x, y, z)

  if (length === 0) {
    return [0, 1, 0]
  }

  return [x / length, y / length, z / length]
}

function dot(
  [ax, ay, az]: readonly [number, number, number],
  [bx, by, bz]: readonly [number, number, number],
): number {
  return ax * bx + ay * by + az * bz
}

function cross(
  [ax, ay, az]: readonly [number, number, number],
  [bx, by, bz]: readonly [number, number, number],
): [number, number, number] {
  return [ay * bz - az * by, az * bx - ax * bz, ax * by - ay * bx]
}

function getVerticalFovRadians(opts?: CameraFitOptions): number {
  if (
    opts?.focalLength !== undefined &&
    opts.sensorHeight !== undefined &&
    opts.focalLength > 0 &&
    opts.sensorHeight > 0
  ) {
    return 2 * Math.atan(opts.sensorHeight / (2 * opts.focalLength))
  }

  const fovDegrees = opts?.fov ?? 50
  const fovRadians = (fovDegrees * Math.PI) / 180

  if (!Number.isFinite(fovRadians) || fovRadians <= 0) {
    return (50 * Math.PI) / 180
  }

  // Keep away from 0 and PI to avoid unstable tan() values.
  return Math.min(Math.max(fovRadians, 0.01), Math.PI - 0.01)
}

function getVerticalFovDegrees(opts?: CameraFitOptions): number {
  return (getVerticalFovRadians(opts) * 180) / Math.PI
}

function getRequiredDistanceForFrustum(
  corners: ReadonlyArray<readonly [number, number, number]>,
  cameraDirection: readonly [number, number, number],
  right: readonly [number, number, number],
  up: readonly [number, number, number],
  tanHalfHorizontal: number,
  tanHalfVertical: number,
): number {
  let requiredDistance = 0

  for (const corner of corners) {
    const u: [number, number, number] = [corner[0], corner[1], corner[2]]
    const un = dot(u, cameraDirection)
    const ur = Math.abs(dot(u, right))
    const uu = Math.abs(dot(u, up))

    const distanceForHorizontal = un + ur / tanHalfHorizontal
    const distanceForVertical = un + uu / tanHalfVertical

    requiredDistance = Math.max(
      requiredDistance,
      distanceForHorizontal,
      distanceForVertical,
    )
  }

  return requiredDistance
}

/**
 * Calculate optimal camera position for PCB viewing based on circuit dimensions
 */
export function getBestCameraPosition(circuitJson: CircuitJson): {
  camPos: readonly [number, number, number]
  lookAt: readonly [number, number, number]
  fov: number
}
export function getBestCameraPosition(
  circuitJson: CircuitJson,
  opts?: CameraFitOptions,
): {
  camPos: readonly [number, number, number]
  lookAt: readonly [number, number, number]
  fov: number
} {
  const verticalFovDegrees = getVerticalFovDegrees(opts)

  // Find panel or board to get dimensions (panel takes priority)
  const panel = circuitJson.find((item) => item.type === "pcb_panel") as
    | PcbPanel
    | undefined
  const board = circuitJson.find((item) => item.type === "pcb_board") as
    | PcbBoard
    | undefined

  const surface = panel || board

  if (!surface) {
    // Default fallback for circuits without explicit board or panel
    return {
      camPos: [30, 30, 25] as const,
      lookAt: [0, 0, 0] as const,
      fov: verticalFovDegrees,
    }
  }

  const { width, height, center } = surface

  // Validate required properties
  if (!width || !height || !center) {
    return {
      camPos: [30, 30, 25] as const,
      lookAt: [0, 0, 0] as const,
      fov: verticalFovDegrees,
    }
  }

  // Board 2D (center.x, center.y) maps to 3D (center.x, 0, center.y)
  const lookAtX = center.x
  const lookAtZ = center.y

  // Camera ray direction from target to camera
  const cameraDirection = normalizeVector(
    opts?.direction ?? DEFAULT_CAMERA_DIRECTION,
  )

  // Camera forward points from camera to target
  const forward: [number, number, number] = [
    -cameraDirection[0],
    -cameraDirection[1],
    -cameraDirection[2],
  ]

  const worldUp: [number, number, number] = [0, 1, 0]
  const right = normalizeVector(cross(forward, worldUp))
  const up = normalizeVector(cross(right, forward))

  const verticalFov = (verticalFovDegrees * Math.PI) / 180
  const aspectRatio =
    opts?.aspectRatio !== undefined &&
    Number.isFinite(opts.aspectRatio) &&
    opts.aspectRatio > 0
      ? opts.aspectRatio
      : 4 / 3

  const tanHalfVertical = Math.tan(verticalFov / 2)
  const tanHalfHorizontal = tanHalfVertical * aspectRatio

  const halfWidth = width / 2
  const halfHeight = height / 2

  const boardCorners: [number, number, number][] = [
    [halfWidth, 0, halfHeight],
    [halfWidth, 0, -halfHeight],
    [-halfWidth, 0, halfHeight],
    [-halfWidth, 0, -halfHeight],
  ]

  const requiredDistanceAssumingVerticalFov = getRequiredDistanceForFrustum(
    boardCorners,
    cameraDirection,
    right,
    up,
    tanHalfHorizontal,
    tanHalfVertical,
  )

  // Some renderers interpret fov as horizontal instead of vertical.
  // Solve that case too and pick the safer distance.
  const tanHalfHorizontalIfFovIsHorizontal = tanHalfVertical
  const tanHalfVerticalIfFovIsHorizontal =
    tanHalfHorizontalIfFovIsHorizontal / aspectRatio

  const requiredDistanceAssumingHorizontalFov = getRequiredDistanceForFrustum(
    boardCorners,
    cameraDirection,
    right,
    up,
    tanHalfHorizontalIfFovIsHorizontal,
    tanHalfVerticalIfFovIsHorizontal,
  )

  const requiredDistance = Math.max(
    requiredDistanceAssumingVerticalFov,
    requiredDistanceAssumingHorizontalFov,
  )

  // Safety floor: keep camera in front of target even for tiny boards.
  const distance = Math.max(requiredDistance, 1)

  const camX = lookAtX + cameraDirection[0] * distance
  const camY = cameraDirection[1] * distance
  const camZ = lookAtZ + cameraDirection[2] * distance

  // GLTF conversion mirrors X in convertMeshToGLTFOrientation,
  // so camera options must be returned in that rendered coordinate space.
  return {
    camPos: [-camX, camY, camZ] as const,
    lookAt: [-lookAtX, 0, lookAtZ] as const,
    fov: verticalFovDegrees,
  }
}
