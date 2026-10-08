import type { BoundingBox, OBJMesh, Point3, Size3, STLMesh } from "../types"
import { boundsOfPositions } from "../utils/bounding-box"
import {
  assertInvertibleLinearTransform,
  getLinearTransformDeterminant,
  type LinearTransform3,
  transformNormal,
} from "../utils/mesh-orientation"

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
    front: {
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
    back: {
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
    top: {
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
    bottom: {
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

/** Serialize outward-wound Scene3D (+Y up, mm) triangles without changing
 * orientation. Authored UVs stay attached to their vertices on every path. */
export function createMeshFromSTL(
  stlMesh: STLMesh,
  opts?: {
    getDefaultUv?: (vertex: Point3) => { u: number; v: number }
  },
): MeshData {
  const getDefaultUv =
    opts?.getDefaultUv ?? ((vertex: Point3) => ({ u: vertex.x, v: vertex.z }))
  const positions: number[] = []
  const normals: number[] = []
  const texcoords: number[] = []
  const indices: number[] = []
  for (const triangle of stlMesh.triangles) {
    for (const [i, vertex] of triangle.vertices.entries()) {
      indices.push(positions.length / 3)
      positions.push(vertex.x, vertex.y, vertex.z)
      normals.push(triangle.normal.x, triangle.normal.y, triangle.normal.z)
      const uv = triangle.uvs?.[i] ?? getDefaultUv(vertex)
      texcoords.push(uv.u, uv.v)
    }
  }
  return { positions, normals, texcoords, indices }
}

export function createMeshFromOBJ(
  objMesh: OBJMesh,
): { meshData: MeshData; materialIndex: number }[] {
  if (!objMesh.materials || objMesh.materials.size === 0) {
    return [{ meshData: createMeshFromSTL(objMesh), materialIndex: -1 }]
  }
  const groups = new Map<number, STLMesh["triangles"]>()
  for (const triangle of objMesh.triangles) {
    const materialIndex = triangle.materialIndex ?? -1
    const triangles = groups.get(materialIndex) ?? []
    triangles.push(triangle)
    groups.set(materialIndex, triangles)
  }
  if (groups.size === 0) {
    return [{ meshData: createMeshFromSTL(objMesh), materialIndex: -1 }]
  }
  return [...groups].map(([materialIndex, triangles]) => ({
    materialIndex,
    meshData: createMeshFromSTL({ ...objMesh, triangles }),
  }))
}

/** Transform points (mm) and normals (directions) in the internal scene frame
 * (+X circuit X, +Y circuit Z, +Z circuit Y). Rotation angles are radians with
 * axes remapped by circuit-to-3d. Apply circuit Z, then Y, then X, matching
 * 3d-viewer's getBaseCadRotation / THREE.Euler(..., "XYZ"). The axis swap
 * changes handedness, hence the negative scene-axis rotations below.
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

  if (scale) {
    // Paired with mesh-scale.scaleMeshByAxis: normals are directions in this
    // scene frame, transformed with the inverse transpose before rotation.
    const matrix: LinearTransform3 = [
      scale.x,
      0,
      0,
      0,
      scale.y,
      0,
      0,
      0,
      scale.z,
    ]
    assertInvertibleLinearTransform(matrix)
    for (let i = 0; i < result.normals.length; i += 3) {
      const normal = transformNormal(
        {
          x: result.normals[i]!,
          y: result.normals[i + 1]!,
          z: result.normals[i + 2]!,
        },
        matrix,
      )
      result.normals[i] = normal.x
      result.normals[i + 1] = normal.y
      result.normals[i + 2] = normal.z
    }
    if (getLinearTransformDeterminant(matrix) < 0) {
      for (let i = 0; i < result.indices.length; i += 3) {
        ;[result.indices[i + 1], result.indices[i + 2]] = [
          result.indices[i + 2]!,
          result.indices[i + 1]!,
        ]
      }
    }
  }

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

    if (rotation) {
      const cosY = Math.cos(rotation.y)
      const sinY = Math.sin(rotation.y)
      const rx = x * cosY - z * sinY
      const rz = x * sinY + z * cosY
      x = rx
      z = rz

      const cosZ = Math.cos(rotation.z)
      const sinZ = Math.sin(rotation.z)
      const rx2 = x * cosZ + y * sinZ
      const ry2 = -x * sinZ + y * cosZ
      x = rx2
      y = ry2

      const cosX = Math.cos(rotation.x)
      const sinX = Math.sin(rotation.x)
      const ry = y * cosX + z * sinX
      const rz2 = -y * sinX + z * cosX
      y = ry
      z = rz2
    }

    // Apply translation
    result.positions[i] = x + translation.x
    result.positions[i + 1] = y + translation.y
    result.positions[i + 2] = z + translation.z
  }

  // Also transform normals if there was rotation
  if (rotation) {
    for (let i = 0; i < result.normals.length; i += 3) {
      let nx = result.normals[i]!
      let ny = result.normals[i + 1]!
      let nz = result.normals[i + 2]!

      const cosY = Math.cos(rotation.y)
      const sinY = Math.sin(rotation.y)
      const rnx = nx * cosY - nz * sinY
      const rnz = nx * sinY + nz * cosY
      nx = rnx
      nz = rnz

      const cosZ = Math.cos(rotation.z)
      const sinZ = Math.sin(rotation.z)
      const rnx2 = nx * cosZ + ny * sinZ
      const rny2 = -nx * sinZ + ny * cosZ
      nx = rnx2
      ny = rny2

      const cosX = Math.cos(rotation.x)
      const sinX = Math.sin(rotation.x)
      const rny = ny * cosX + nz * sinX
      const rnz2 = -ny * sinX + nz * cosX
      ny = rny
      nz = rnz2

      result.normals[i] = nx
      result.normals[i + 1] = ny
      result.normals[i + 2] = nz
    }
  }

  return result
}

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
    const x = result.positions[i]
    if (typeof x === "number") {
      result.positions[i] = -x
    }
  }

  for (let i = 0; i < result.normals.length; i += 3) {
    const nx = result.normals[i]
    if (typeof nx === "number") {
      result.normals[i] = -nx
    }
  }

  for (let i = 0; i < result.indices.length; i += 3) {
    const i1 = result.indices[i + 1]
    const i2 = result.indices[i + 2]

    if (typeof i1 === "number" && typeof i2 === "number") {
      result.indices[i + 1] = i2
      result.indices[i + 2] = i1
    }
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
