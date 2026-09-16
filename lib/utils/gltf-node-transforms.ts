import type { Point3 } from "../types"

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
}

/**
 * Apply a node transform (translation, rotation, scale) to a point.
 * Order: scale -> rotate -> translate
 */
export function applyNodeTransform(p: Point3, node: NodeTransform): Point3 {
  let result = { ...p }

  // Apply scale first
  if (node.scale) {
    result = {
      x: result.x * node.scale[0]!,
      y: result.y * node.scale[1]!,
      z: result.z * node.scale[2]!,
    }
  }

  // Apply rotation (quaternion)
  if (node.rotation) {
    result = applyQuaternion(
      result,
      node.rotation as [number, number, number, number],
    )
  }

  // Apply translation
  if (node.translation) {
    result = {
      x: result.x + node.translation[0]!,
      y: result.y + node.translation[1]!,
      z: result.z + node.translation[2]!,
    }
  }

  return result
}

/**
 * Build a map of mesh index to accumulated node transforms.
 * Traverses the GLTF scene graph to collect transforms for each mesh.
 */
export function buildMeshTransforms(
  gltf: any,
  strictGeometry = false,
): Map<number, NodeTransform[]> {
  const meshTransforms = new Map<number, NodeTransform[]>()

  if (!gltf.nodes) return meshTransforms
  if (strictGeometry) {
    const meshIds = new Set<number>()
    for (const node of gltf.nodes) {
      if (node.matrix !== undefined)
        throw new Error(
          "glTF node.matrix is unsupported by strict geometry preparation",
        )
      if (node.mesh !== undefined) {
        if (meshIds.has(node.mesh))
          throw new Error(
            "Repeated glTF mesh instances are unsupported by strict geometry preparation",
          )
        meshIds.add(node.mesh)
      }
    }
  }
  const visitedNodes = new Set<number>()

  // Process all nodes and collect transforms for meshes
  function processNode(nodeIndex: number, parentTransforms: NodeTransform[]) {
    const node = gltf.nodes[nodeIndex]
    if (!node) return
    if (strictGeometry && visitedNodes.has(nodeIndex))
      throw new Error(
        "Repeated glTF node references are unsupported by strict geometry preparation",
      )
    visitedNodes.add(nodeIndex)

    const currentTransforms = [...parentTransforms]
    if (node.translation || node.rotation || node.scale) {
      currentTransforms.push({
        translation: node.translation,
        rotation: node.rotation,
        scale: node.scale,
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
  if (gltf.scenes && gltf.scenes[0]?.nodes) {
    for (const rootNodeIndex of gltf.scenes[0].nodes) {
      processNode(rootNodeIndex, [])
    }
  }

  return meshTransforms
}
