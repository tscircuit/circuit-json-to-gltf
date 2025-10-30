import type { Point3, Size3, STLMesh, OBJMesh, Triangle } from "../types"

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
      texcoords.push(vertex.x, vertex.z)
    }

    // Add indices (reverse winding for correct face orientation)
    indices.push(vertexIndex, vertexIndex + 2, vertexIndex + 1)
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
      targetMesh.texcoords.push(vertex.x, vertex.z)
    }

    targetMesh.indices.push(baseIndex, baseIndex + 2, baseIndex + 1)
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

    // Apply rotation (simplified - proper rotation would use quaternions)
    if (rotation) {
      // Rotation around Y axis
      const cosY = Math.cos(rotation.y)
      const sinY = Math.sin(rotation.y)
      const rx = x * cosY - z * sinY
      const rz = x * sinY + z * cosY
      x = rx
      z = rz

      // Rotation around X axis
      const cosX = Math.cos(rotation.x)
      const sinX = Math.sin(rotation.x)
      const ry = y * cosX - z * sinX
      const rz2 = y * sinX + z * cosX
      y = ry
      z = rz2

      // Rotation around Z axis
      const cosZ = Math.cos(rotation.z)
      const sinZ = Math.sin(rotation.z)
      const rx2 = x * cosZ - y * sinZ
      const ry2 = x * sinZ + y * cosZ
      x = rx2
      y = ry2
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

      // Apply same rotations to normals
      // Rotation around Y axis
      const cosY = Math.cos(rotation.y)
      const sinY = Math.sin(rotation.y)
      const rnx = nx * cosY - nz * sinY
      const rnz = nx * sinY + nz * cosY
      nx = rnx
      nz = rnz

      // Rotation around X axis
      const cosX = Math.cos(rotation.x)
      const sinX = Math.sin(rotation.x)
      const rny = ny * cosX - nz * sinX
      const rnz2 = ny * sinX + nz * cosX
      ny = rny
      nz = rnz2

      // Rotation around Z axis
      const cosZ = Math.cos(rotation.z)
      const sinZ = Math.sin(rotation.z)
      const rnx2 = nx * cosZ - ny * sinZ
      const rny2 = nx * sinZ + ny * cosZ
      nx = rnx2
      ny = rny2

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

export function getBounds(positions: number[]): { min: Point3; max: Point3 } {
  if (positions.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    }
  }

  let minX = Infinity,
    minY = Infinity,
    minZ = Infinity
  let maxX = -Infinity,
    maxY = -Infinity,
    maxZ = -Infinity

  for (let i = 0; i < positions.length; i += 3) {
    const x = positions[i]!
    const y = positions[i + 1]!
    const z = positions[i + 2]!

    minX = Math.min(minX, x)
    minY = Math.min(minY, y)
    minZ = Math.min(minZ, z)
    maxX = Math.max(maxX, x)
    maxY = Math.max(maxY, y)
    maxZ = Math.max(maxZ, z)
  }

  return {
    min: { x: minX, y: minY, z: minZ },
    max: { x: maxX, y: maxY, z: maxZ },
  }
}
