import type { Point3, Size3, STLMesh, OBJMesh, Triangle } from "../types"
import type { BoundingBox } from "../types"
import { boundsOfPositions } from "../utils/bounding-box"
import * as vec3 from "@jscad/modeling/src/maths/vec3"
import { getCadRotationMatrix } from "../utils/cad-rotation"

export interface MeshData {
  positions: number[]
  normals: number[]
  texcoords: number[]
  indices: number[]
  colors?: number[]
}

export interface FaceMeshData {
  top: MeshData
  bottom: MeshData
  front: MeshData
  back: MeshData
  left: MeshData
  right: MeshData
}

export function createBoxMesh(size: Size3): MeshData {
  const hw = size.x / 2
  const hh = size.y / 2
  const hd = size.z / 2

  // Vertices for a box (8 vertices, 6 faces)
  const positions: number[] = []
  const normals: number[] = []
  const texcoords: number[] = []
  const indices: number[] = []

  // Define the 6 faces
  const faces = [
    // Front face (positive Z)
    {
      vertices: [
        [-hw, -hh, hd],
        [hw, -hh, hd],
        [hw, hh, hd],
        [-hw, hh, hd],
      ],
      normal: [0, 0, 1],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    },
    // Back face (negative Z)
    {
      vertices: [
        [hw, -hh, -hd],
        [-hw, -hh, -hd],
        [-hw, hh, -hd],
        [hw, hh, -hd],
      ],
      normal: [0, 0, -1],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    },
    // Top face (positive Y)
    {
      vertices: [
        [-hw, hh, hd],
        [hw, hh, hd],
        [hw, hh, -hd],
        [-hw, hh, -hd],
      ],
      normal: [0, 1, 0],
      uvs: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    },
    // Bottom face (negative Y)
    {
      vertices: [
        [-hw, -hh, -hd],
        [hw, -hh, -hd],
        [hw, -hh, hd],
        [-hw, -hh, hd],
      ],
      normal: [0, -1, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    },
    // Right face (positive X)
    {
      vertices: [
        [hw, -hh, hd],
        [hw, -hh, -hd],
        [hw, hh, -hd],
        [hw, hh, hd],
      ],
      normal: [1, 0, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    },
    // Left face (negative X)
    {
      vertices: [
        [-hw, -hh, -hd],
        [-hw, -hh, hd],
        [-hw, hh, hd],
        [-hw, hh, -hd],
      ],
      normal: [-1, 0, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    },
  ]

  let vertexIndex = 0
  for (const face of faces) {
    // Add vertices for this face
    for (let i = 0; i < 4; i++) {
      const vertex = face.vertices[i]!
      positions.push(vertex[0]!, vertex[1]!, vertex[2]!)
      normals.push(face.normal[0]!, face.normal[1]!, face.normal[2]!)
      texcoords.push(face.uvs[i]![0]!, face.uvs[i]![1]!)
    }

    // Add two triangles for the quad
    indices.push(
      vertexIndex,
      vertexIndex + 1,
      vertexIndex + 2,
      vertexIndex,
      vertexIndex + 2,
      vertexIndex + 3,
    )
    vertexIndex += 4
  }

  return { positions, normals, texcoords, indices }
}

export function createBoxMeshByFaces(size: Size3): FaceMeshData {
  const hw = size.x / 2
  const hh = size.y / 2
  const hd = size.z / 2

  // Define the 6 faces as separate meshes
  const faceDefinitions = {
    // Front face (positive Z)
    top: {
      vertices: [
        [-hw, -hh, hd],
        [hw, -hh, hd],
        [hw, hh, hd],
        [-hw, hh, hd],
      ],
      normal: [0, 0, 1],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    },
    // Back face (negative Z)
    bottom: {
      vertices: [
        [hw, -hh, -hd],
        [-hw, -hh, -hd],
        [-hw, hh, -hd],
        [hw, hh, -hd],
      ],
      normal: [0, 0, -1],
      uvs: [
        [1, 1],
        [0, 1],
        [0, 0],
        [1, 0],
      ],
    },
    // Top face (positive Y)
    front: {
      vertices: [
        [-hw, hh, hd],
        [hw, hh, hd],
        [hw, hh, -hd],
        [-hw, hh, -hd],
      ],
      normal: [0, 1, 0],
      uvs: [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    },
    // Bottom face (negative Y)
    back: {
      vertices: [
        [-hw, -hh, -hd],
        [hw, -hh, -hd],
        [hw, -hh, hd],
        [-hw, -hh, hd],
      ],
      normal: [0, -1, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    },
    // Right face (positive X)
    right: {
      vertices: [
        [hw, -hh, hd],
        [hw, -hh, -hd],
        [hw, hh, -hd],
        [hw, hh, hd],
      ],
      normal: [1, 0, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    },
    // Left face (negative X)
    left: {
      vertices: [
        [-hw, -hh, -hd],
        [-hw, -hh, hd],
        [-hw, hh, hd],
        [-hw, hh, -hd],
      ],
      normal: [-1, 0, 0],
      uvs: [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    },
  }

  const result: FaceMeshData = {} as FaceMeshData

  for (const [faceName, face] of Object.entries(faceDefinitions)) {
    const positions: number[] = []
    const normals: number[] = []
    const texcoords: number[] = []
    const indices = [0, 1, 2, 0, 2, 3]

    // Add vertices for this face
    for (let i = 0; i < 4; i++) {
      const vertex = face.vertices[i]!
      positions.push(vertex[0]!, vertex[1]!, vertex[2]!)
      normals.push(face.normal[0]!, face.normal[1]!, face.normal[2]!)
      texcoords.push(face.uvs[i]![0]!, face.uvs[i]![1]!)
    }

    result[faceName as keyof FaceMeshData] = {
      positions,
      normals,
      texcoords,
      indices,
    }
  }

  return result
}

export function createMeshFromSTL(stlMesh: STLMesh): MeshData {
  const positions: number[] = []
  const normals: number[] = []
  const texcoords: number[] = []
  const indices: number[] = []

  let vertexIndex = 0

  for (const triangle of stlMesh.triangles) {
    // Add vertices
    for (const vertex of triangle.vertices) {
      positions.push(vertex.x, vertex.y, vertex.z)
      normals.push(triangle.normal.x, triangle.normal.y, triangle.normal.z)
      // Simple planar UV mapping
      texcoords.push(vertex.x, vertex.y)
    }

    indices.push(vertexIndex, vertexIndex + 1, vertexIndex + 2)
    vertexIndex += 3
  }

  return { positions, normals, texcoords, indices }
}

export function createMeshFromOBJ(
  objMesh: OBJMesh,
): { meshData: MeshData; materialIndex: number }[] {
  if (!objMesh.materials || objMesh.materials.size === 0) {
    return [{ meshData: createMeshFromSTL(objMesh), materialIndex: -1 }]
  }

  const materialMeshes = new Map<number, MeshData>()

  for (const triangle of objMesh.triangles) {
    const materialIndex = triangle.materialIndex ?? -1

    if (!materialMeshes.has(materialIndex)) {
      materialMeshes.set(materialIndex, {
        positions: [],
        normals: [],
        texcoords: [],
        indices: [],
      })
    }

    const targetMesh = materialMeshes.get(materialIndex)!
    const baseIndex = targetMesh.positions.length / 3

    for (const vertex of triangle.vertices) {
      targetMesh.positions.push(vertex.x, vertex.y, vertex.z)
      targetMesh.normals.push(
        triangle.normal.x,
        triangle.normal.y,
        triangle.normal.z,
      )
      targetMesh.texcoords.push(vertex.x, vertex.y)
    }

    targetMesh.indices.push(baseIndex, baseIndex + 1, baseIndex + 2)
  }

  const result: { meshData: MeshData; materialIndex: number }[] = []

  for (const [materialIndex, meshData] of materialMeshes) {
    if (meshData.positions.length > 0) {
      result.push({ meshData, materialIndex })
    }
  }

  return result.length > 0
    ? result
    : [{ meshData: createMeshFromSTL(objMesh), materialIndex: -1 }]
}

/**
 * Canonical local -> canonical world, both right-handed Z-up millimeters.
 * Scale, intrinsic XYZ rotation (radians), then translation. Normals are
 * directions and receive the inverse-transpose linear transform, never translation.
 */
export function transformMesh(
  mesh: MeshData,
  translation: Point3,
  rotation?: Point3,
  scale?: Point3,
): MeshData {
  const result: MeshData = {
    positions: [...mesh.positions],
    normals: [...mesh.normals],
    texcoords: [...mesh.texcoords],
    indices: [...mesh.indices],
  }

  if (mesh.colors) {
    result.colors = [...mesh.colors]
  }
  const rotationMatrix = getCadRotationMatrix(rotation ?? { x: 0, y: 0, z: 0 })
  const singularScale =
    scale && (scale.x === 0 || scale.y === 0 || scale.z === 0)

  // Apply transformations to positions
  for (let i = 0; i < result.positions.length; i += 3) {
    let x = result.positions[i]!
    let y = result.positions[i + 1]!
    let z = result.positions[i + 2]!

    // Apply scale
    if (scale) {
      x *= scale.x
      y *= scale.y
      z *= scale.z
    }

    const rotated = vec3.transform(vec3.create(), [x, y, z], rotationMatrix)
    // Apply translation
    result.positions[i] = rotated[0] + translation.x
    result.positions[i + 1] = rotated[1] + translation.y
    result.positions[i + 2] = rotated[2] + translation.z
  }

  if (rotation || scale) {
    for (let i = 0; i < result.normals.length; i += 3) {
      const normal = singularScale
        ? vec3.create()
        : vec3.transform(
            vec3.create(),
            [
              result.normals[i]! / (scale?.x ?? 1),
              result.normals[i + 1]! / (scale?.y ?? 1),
              result.normals[i + 2]! / (scale?.z ?? 1),
            ],
            rotationMatrix,
          )
      vec3.normalize(normal, normal)
      result.normals[i] = normal[0]
      result.normals[i + 1] = normal[1]
      result.normals[i + 2] = normal[2]
    }
  }
  if (scale && scale.x * scale.y * scale.z < 0) {
    for (let i = 0; i < result.indices.length; i += 3) {
      const second = result.indices[i + 1]!
      result.indices[i + 1] = result.indices[i + 2]!
      result.indices[i + 2] = second
    }
  }

  return result
}

/** Canonical P -> glTF G=(-P.x,P.z,P.y), a proper rotation, in mm. */
export function convertMeshToGLTFOrientation(mesh: MeshData): MeshData {
  const result: MeshData = {
    positions: [...mesh.positions],
    normals: [...mesh.normals],
    texcoords: [...mesh.texcoords],
    indices: [...mesh.indices],
  }

  if (mesh.colors) {
    result.colors = [...mesh.colors]
  }

  for (let i = 0; i < result.positions.length; i += 3) {
    const [x, y, z] = result.positions.slice(i, i + 3)
    result.positions[i] = -x!
    result.positions[i + 1] = z!
    result.positions[i + 2] = y!
  }

  for (let i = 0; i < result.normals.length; i += 3) {
    const [x, y, z] = result.normals.slice(i, i + 3)
    result.normals[i] = -x!
    result.normals[i + 1] = z!
    result.normals[i + 2] = y!
  }

  return result
}

/**
 * Axis-aligned bounds of a flat position array, as glTF accessors declare
 * them. Delegates to the shared scan so the empty-input rule (a zero box, not
 * Infinity) is stated once for every bounds in this package.
 */
export function getBounds(positions: number[]): BoundingBox {
  return boundsOfPositions(positions)
}
