import { mat4, vec3 } from "gl-matrix"
import type { Point3, Triangle } from "../types"
import { transformTriangle } from "./mesh-orientation"

/**
 * Apply a quaternion rotation to a point.
 * Quaternion format: [x, y, z, w]
 */
export function applyQuaternion(
  p: Point3,
  q: [number, number, number, number],
): Point3 {
  const [qx, qy, qz, qw] = q
  const { x, y, z } = p

  // Quaternion rotation formula: p' = q * p * q^-1
  const ix = qw * x + qy * z - qz * y
  const iy = qw * y + qz * x - qx * z
  const iz = qw * z + qx * y - qy * x
  const iw = -qx * x - qy * y - qz * z

  return {
    x: ix * qw + iw * -qx + iy * -qz - iz * -qy,
    y: iy * qw + iw * -qy + iz * -qx - ix * -qz,
    z: iz * qw + iw * -qz + ix * -qy - iy * -qx,
  }
}

export interface NodeTransform {
  translation?: number[]
  rotation?: number[]
  scale?: number[]
  matrix?: number[]
}

/**
 * Transform a point from glTF node-local to parent space (Y-up, source units).
 * As in glTF's node contract, an explicit column-major matrix takes precedence
 * over TRS; otherwise the order is scale -> rotate -> translate.
 */
export function applyNodeTransform(p: Point3, node: NodeTransform): Point3 {
  const result = vec3.transformMat4(
    vec3.create(),
    [p.x, p.y, p.z],
    nodeTransformMatrix(node),
  )
  return { x: result[0]!, y: result[1]!, z: result[2]! }
}

function nodeTransformMatrix(node: NodeTransform): mat4 {
  if (node.matrix) return mat4.clone(node.matrix)
  return mat4.fromRotationTranslationScale(
    mat4.create(),
    node.rotation ?? [0, 0, 0, 1],
    node.translation ?? [0, 0, 0],
    node.scale ?? [1, 1, 1],
  )
}

/**
 * Compose glTF node-local -> world transforms in glTF's Y-up/source-unit frame.
 * buildMeshTransforms records ancestors first, so world = parent * local, as
 * specified by the glTF node hierarchy (the local transform acts first).
 */
export function composeNodeTransforms(transforms: NodeTransform[]): mat4 {
  const worldMatrix = mat4.create()
  for (const transform of transforms) {
    mat4.multiply(worldMatrix, worldMatrix, nodeTransformMatrix(transform))
  }
  return worldMatrix
}

/**
 * Bake a glTF node-local triangle into world space (Y-up, source units).
 * Points receive translation; normal directions use the inverse transpose.
 * A reflected world matrix reverses vertex/UV order once to retain outward
 * facing triangles. This runs before the loader's coordinate-frame conversion.
 */
export function applyNodeTransformToTriangle(
  triangle: Triangle,
  worldMatrix: mat4,
): Triangle {
  const transformed = transformTriangle(triangle, [
    worldMatrix[0]!,
    worldMatrix[4]!,
    worldMatrix[8]!,
    worldMatrix[1]!,
    worldMatrix[5]!,
    worldMatrix[9]!,
    worldMatrix[2]!,
    worldMatrix[6]!,
    worldMatrix[10]!,
  ])
  transformed.vertices = transformed.vertices.map((vertex) => ({
    x: vertex.x + worldMatrix[12]!,
    y: vertex.y + worldMatrix[13]!,
    z: vertex.z + worldMatrix[14]!,
  })) as Triangle["vertices"]
  return transformed
}

/**
 * Collect ancestor-first glTF node-local transforms (Y-up, source units).
 * This retains the loader's existing single-transform-per-mesh behavior.
 */
export function buildMeshTransforms(gltf: any): Map<number, NodeTransform[]> {
  const meshTransforms = new Map<number, NodeTransform[]>()

  if (!gltf.nodes) return meshTransforms

  // Process all nodes and collect transforms for meshes
  function processNode(nodeIndex: number, parentTransforms: NodeTransform[]) {
    const node = gltf.nodes[nodeIndex]
    if (!node) return

    const currentTransforms = [...parentTransforms]
    if (node.translation || node.rotation || node.scale || node.matrix) {
      currentTransforms.push({
        translation: node.translation,
        rotation: node.rotation,
        scale: node.scale,
        matrix: node.matrix,
      })
    }

    if (node.mesh !== undefined) {
      meshTransforms.set(node.mesh, currentTransforms)
    }

    if (node.children) {
      for (const childIndex of node.children) {
        processNode(childIndex, currentTransforms)
      }
    }
  }

  // Start from scene root nodes
  const scene = gltf.scenes?.[gltf.scene ?? 0]
  if (scene?.nodes) {
    for (const rootNodeIndex of scene.nodes) {
      processNode(rootNodeIndex, [])
    }
  }

  return meshTransforms
}
