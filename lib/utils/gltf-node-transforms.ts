import * as mat4 from "@jscad/modeling/src/maths/mat4"
import * as vec3 from "@jscad/modeling/src/maths/vec3"
import type { Point3, Triangle } from "../types"

interface GLTFNode {
  mesh?: number
  children?: number[]
  matrix?: number[]
  translation?: number[]
  rotation?: number[]
  scale?: number[]
}

interface GLTFGraph {
  nodes?: GLTFNode[]
  meshes?: unknown[]
  scenes?: { nodes?: number[] }[]
  scene?: number
}

interface GLTFMeshInstance {
  meshIndex: number
  matrix: mat4.Mat4
  normalMatrix: mat4.Mat4
  mirrored: boolean
}

function nodeMatrix(node: GLTFNode): mat4.Mat4 {
  if (node.matrix) {
    if (node.matrix.length !== 16 || !node.matrix.every(Number.isFinite)) {
      throw new Error("Invalid glTF node matrix")
    }
    const matrix = mat4.create()
    for (let i = 0; i < 16; i++) matrix[i] = node.matrix[i]!
    return matrix
  }

  const matrix = mat4.create()
  if (node.translation) {
    mat4.translate(matrix, matrix, [
      node.translation[0]!,
      node.translation[1]!,
      node.translation[2]!,
    ])
  }
  if (node.rotation) {
    const [x, y, z, w] = node.rotation
    const sinHalfAngle = Math.hypot(x!, y!, z!)
    if (sinHalfAngle > 0) {
      const rotation = mat4.fromRotation(
        mat4.create(),
        2 * Math.atan2(sinHalfAngle, w!),
        [x! / sinHalfAngle, y! / sinHalfAngle, z! / sinHalfAngle],
      )
      mat4.multiply(matrix, matrix, rotation)
    }
  }
  if (node.scale) {
    mat4.scale(matrix, matrix, [node.scale[0]!, node.scale[1]!, node.scale[2]!])
  }
  return matrix
}

function meshInstance(meshIndex: number, matrix: mat4.Mat4): GLTFMeshInstance {
  const x = vec3.fromValues(matrix[0], matrix[1], matrix[2])
  const y = vec3.fromValues(matrix[4], matrix[5], matrix[6])
  const z = vec3.fromValues(matrix[8], matrix[9], matrix[10])
  const cofactors = [
    vec3.cross(vec3.create(), y, z),
    vec3.cross(vec3.create(), z, x),
    vec3.cross(vec3.create(), x, y),
  ]
  const determinant = vec3.dot(x, cofactors[0]!)
  if (!Number.isFinite(determinant)) {
    throw new Error(`Invalid glTF transform for mesh ${meshIndex}`)
  }
  if (determinant === 0) {
    // Three's singular normal matrix is zero; keep the collapsed positions.
    return {
      meshIndex,
      matrix,
      normalMatrix: mat4.fromScaling(mat4.create(), [0, 0, 0]),
      mirrored: false,
    }
  }

  // Cofactor columns / determinant give the inverse transpose, including
  // nonuniform scale and nested shear.
  const normalMatrix = mat4.create()
  for (const [column, cofactor] of cofactors.entries()) {
    const axis = vec3.scale(vec3.create(), cofactor, 1 / determinant)
    for (let row = 0; row < 3; row++) {
      normalMatrix[column * 4 + row] = axis[row]!
    }
  }
  return { meshIndex, matrix, normalMatrix, mirrored: determinant < 0 }
}

/**
 * Flatten the active asset scene, or all unparented nodes when scenes are
 * absent, with an identity virtual root and matrixWorld = parent * (T * R * S).
 * Coordinates remain in asset-root axes and units, with no Y/Z remapping.
 */
export function buildGLTFMeshInstances(gltf: GLTFGraph): GLTFMeshInstance[] {
  let roots: number[] | undefined
  if (gltf.scenes !== undefined || gltf.scene !== undefined) {
    const sceneIndex = gltf.scene === undefined ? 0 : gltf.scene
    const scene = gltf.scenes?.[sceneIndex]
    if (!Number.isInteger(sceneIndex) || sceneIndex < 0 || !scene) {
      throw new Error(`Missing glTF scene ${sceneIndex}`)
    }
    roots = scene.nodes ?? []
  }

  // Legacy standalone mesh payloads have no scene graph at all.
  if (!gltf.nodes && !gltf.scenes) {
    return (gltf.meshes ?? []).map((_, meshIndex) =>
      meshInstance(meshIndex, mat4.create()),
    )
  }

  const nodes = gltf.nodes ?? []
  const parents = new Set<number>()
  for (const [index, node] of nodes.entries()) {
    if (
      node.mesh !== undefined &&
      (!Number.isInteger(node.mesh) ||
        node.mesh < 0 ||
        !gltf.meshes?.[node.mesh])
    ) {
      throw new Error(`Missing glTF mesh ${node.mesh} at node ${index}`)
    }
    for (const child of node.children ?? []) {
      if (!Number.isInteger(child) || child < 0 || !nodes[child]) {
        throw new Error(`Missing glTF node ${child}`)
      }
      if (parents.has(child)) {
        throw new Error(`Multiple parents for glTF node ${child}`)
      }
      parents.add(child)
    }
  }

  // Validate every node, including rootless cycles that root traversal misses.
  const ancestors = new Set<number>()
  const validated = new Set<number>()
  const validate = (index: number) => {
    if (ancestors.has(index)) {
      throw new Error(`Cycle in glTF node hierarchy at node ${index}`)
    }
    if (validated.has(index)) return
    ancestors.add(index)
    for (const child of nodes[index]!.children ?? []) validate(child)
    ancestors.delete(index)
    validated.add(index)
  }
  for (let index = 0; index < nodes.length; index++) validate(index)

  roots ??= nodes.flatMap((_, index) => (parents.has(index) ? [] : [index]))
  const sceneRoots = new Set<number>()
  for (const root of roots) {
    if (!Number.isInteger(root) || root < 0 || !nodes[root]) {
      throw new Error(`Missing glTF node ${root}`)
    }
    if (parents.has(root) || sceneRoots.has(root)) {
      throw new Error(`Multiple parents for glTF node ${root}`)
    }
    sceneRoots.add(root)
  }

  const instances: GLTFMeshInstance[] = []
  const visit = (index: number, parent: mat4.Mat4) => {
    const node = nodes[index]!
    const matrix = mat4.multiply(mat4.create(), parent, nodeMatrix(node))
    if (node.mesh !== undefined) {
      instances.push(meshInstance(node.mesh, matrix))
    }
    for (const child of node.children ?? []) visit(child, matrix)
  }

  for (const root of roots) visit(root, mat4.create())
  return instances
}

/** Transform a mesh-local point into asset-root axes and units. */
export function transformGLTFInstancePoint(
  point: Point3,
  instance: GLTFMeshInstance,
): Point3 {
  const [x, y, z] = vec3.transform(
    vec3.create(),
    [point.x, point.y, point.z],
    instance.matrix,
  )
  return { x, y, z }
}

/** Bake mesh-local points and normals into asset-root space, preserving faces. */
export function transformGLTFInstanceTriangle(
  triangle: Triangle,
  instance: GLTFMeshInstance,
): Triangle {
  const vertices: Triangle["vertices"] = [
    transformGLTFInstancePoint(triangle.vertices[0], instance),
    transformGLTFInstancePoint(triangle.vertices[1], instance),
    transformGLTFInstancePoint(triangle.vertices[2], instance),
  ]
  if (instance.mirrored) {
    ;[vertices[1], vertices[2]] = [vertices[2], vertices[1]]
  }
  const normal = vec3.transform(
    vec3.create(),
    [triangle.normal.x, triangle.normal.y, triangle.normal.z],
    instance.normalMatrix,
  )
  vec3.normalize(normal, normal)
  return {
    ...triangle,
    vertices,
    normal: { x: normal[0], y: normal[1], z: normal[2] },
  }
}
