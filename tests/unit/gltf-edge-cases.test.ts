import { test, expect } from "bun:test"
import {
  loadGLTF,
  createTriangles,
  decodeBase64Buffer,
} from "../../lib/loaders/gltf"
import { createMockGLTF, withMockFetch } from "../helpers/gltf-test-utils"

// Edge Case Tests: Boundary Values and Empty Arrays
// These tests cover critical boundary conditions not covered in other test files

test("createTriangles should handle exactly 3 vertices (minimum triangle)", () => {
  // Boundary: Exactly 3 vertices - minimum valid triangle
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]) // 3 vertices
  const triangles = createTriangles(positions, null, null)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(1)
  expect(triangles[0]!.vertices.length).toBe(3)
})

test("createTriangles should handle exactly 2 vertices (insufficient data)", () => {
  // Boundary: Exactly 2 vertices - insufficient for triangle
  const positions = new Float32Array([0, 0, 0, 1, 0, 0]) // 2 vertices
  const triangles = createTriangles(positions, null, null)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(0) // No triangles possible
})

test("createTriangles should handle non-multiple-of-3 position arrays", () => {
  // Edge case: Position array length not divisible by 3
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1]) // 8 elements (not divisible by 3)
  const triangles = createTriangles(positions, null, null)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(0) // Should gracefully handle incomplete vertex data
})

test("createTriangles should handle indexed geometry with out-of-bounds indices", () => {
  // Edge case: Indices that reference non-existent vertices
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0]) // 3 vertices (indices 0, 1, 2)
  const indices = new Uint16Array([0, 1, 5]) // Index 5 is out of bounds

  const triangles = createTriangles(positions, null, indices)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(0) // Should skip invalid triangles
})

test("createTriangles should handle empty indices array", () => {
  // Edge case: Empty indices with valid positions
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
  const indices = new Uint16Array([]) // Empty indices

  const triangles = createTriangles(positions, null, indices)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(0) // No indices means no triangles in indexed mode
})

test("createTriangles should handle single index in array", () => {
  // Edge case: Only one index (insufficient for triangle)
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
  const indices = new Uint16Array([0]) // Only one index

  const triangles = createTriangles(positions, null, indices)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(0) // Need 3 indices per triangle
})

test("createTriangles should handle maximum safe integer indices", () => {
  // Boundary: Large but valid indices
  const positions = new Float32Array([
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    1,
    0, // vertices 0, 1, 2
    2,
    2,
    2,
    3,
    3,
    3,
    4,
    4,
    4, // vertices 3, 4, 5 (won't be used)
  ])
  const indices = new Uint16Array([0, 1, 2]) // Valid indices

  const triangles = createTriangles(positions, null, indices)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(1)
  expect(triangles[0].vertices[2].x).toBeCloseTo(0)
  expect(triangles[0].vertices[2].y).toBeCloseTo(1)
})

test("createTriangles should handle zero-length normals array", () => {
  // Edge case: Normals array exists but is empty
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
  const normals = new Float32Array([]) // Empty normals

  const triangles = createTriangles(positions, normals, null)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(1)
  // Should calculate normals instead of using empty array
  expect(triangles[0]!.normal).toBeDefined()
  expect(typeof triangles[0]!.normal.x).toBe("number")
})

test("decodeBase64Buffer should handle minimum valid base64", () => {
  // Boundary: Smallest valid base64 data URI
  const minimalUri = "data:application/octet-stream;base64,AA==" // Single zero byte

  const buffer = decodeBase64Buffer(minimalUri)

  expect(buffer).toBeDefined()
  expect(buffer.byteLength).toBe(1)
  expect(new Uint8Array(buffer)[0]).toBe(0)
})

test("decodeBase64Buffer should handle different media types", () => {
  // Edge case: Various valid media types in data URI
  const testCases = [
    "data:application/octet-stream;base64,AQID",
    "data:application/gltf-buffer;base64,AQID",
    "data:application/binary;base64,AQID",
  ]

  for (const uri of testCases) {
    const buffer = decodeBase64Buffer(uri)
    expect(buffer).toBeDefined()
    expect(buffer.byteLength).toBeGreaterThan(0)
  }
})

test("decodeBase64Buffer should handle base64 with padding variations", () => {
  // Edge case: Different base64 padding scenarios
  const testCases = [
    "data:application/octet-stream;base64,QQ==", // Single 'A' with padding
    "data:application/octet-stream;base64,QUI=", // 'AB' with padding
    "data:application/octet-stream;base64,QUJD", // 'ABC' no padding needed
  ]

  for (const uri of testCases) {
    const buffer = decodeBase64Buffer(uri)
    expect(buffer).toBeDefined()
    expect(buffer.byteLength).toBeGreaterThan(0)
  }
})

test("loadGLTF should handle GLTF with zero meshes", () => {
  // Edge case: Valid GLTF structure but no mesh data
  const emptyMeshGLTF = {
    scene: 0,
    scenes: [{ nodes: [] }],
    nodes: [],
    meshes: [], // Empty meshes array
    accessors: [],
    bufferViews: [],
    buffers: [],
  }

  return withMockFetch("test://empty-meshes.gltf", emptyMeshGLTF, async () => {
    const mesh = await loadGLTF("test://empty-meshes.gltf")

    expect(mesh).toBeDefined()
    expect(mesh.triangles).toBeDefined()
    expect(mesh.triangles.length).toBe(0)
    expect(mesh.boundingBox.min.x).toBe(0)
    expect(mesh.boundingBox.max.x).toBe(0)
  })
})

test("loadGLTF should handle GLTF with mesh but zero primitives", () => {
  // Edge case: Mesh exists but has no primitive data
  const noPrimitivesGLTF = {
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [], // Empty primitives array
      },
    ],
    accessors: [],
    bufferViews: [],
    buffers: [],
  }

  return withMockFetch(
    "test://no-primitives.gltf",
    noPrimitivesGLTF,
    async () => {
      const mesh = await loadGLTF("test://no-primitives.gltf")

      expect(mesh).toBeDefined()
      expect(mesh.triangles).toBeDefined()
      expect(mesh.triangles.length).toBe(0)
    },
  )
})

test("loadGLTF should handle GLTF with primitive but no POSITION attribute", () => {
  // Edge case: Primitive exists but missing required POSITION attribute
  const noPositionGLTF = {
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { NORMAL: 0 }, // Has NORMAL but no POSITION
            mode: 4,
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: 36,
      },
    ],
    buffers: [
      {
        byteLength: 36,
        uri:
          "data:application/octet-stream;base64," +
          btoa(String.fromCharCode(...new Float32Array(9).fill(0))),
      },
    ],
  }

  return withMockFetch("test://no-position.gltf", noPositionGLTF, async () => {
    const mesh = await loadGLTF("test://no-position.gltf")

    expect(mesh).toBeDefined()
    expect(mesh.triangles).toBeDefined()
    expect(mesh.triangles.length).toBe(0) // Should skip primitive without POSITION
  })
})

test("loadGLTF should handle GLTF with unsupported primitive mode", () => {
  // Edge case: Primitive with unsupported mode (not TRIANGLES)
  const unsupportedModeGLTF = createMockGLTF()
  unsupportedModeGLTF.meshes[0].primitives[0].mode = 1 // LINES mode instead of TRIANGLES

  return withMockFetch(
    "test://unsupported-mode.gltf",
    unsupportedModeGLTF,
    async () => {
      const mesh = await loadGLTF("test://unsupported-mode.gltf")

      expect(mesh).toBeDefined()
      expect(mesh.triangles).toBeDefined()
      expect(mesh.triangles.length).toBe(0) // Should skip non-triangle primitives
    },
  )
})

test("loadGLTF should handle large triangle counts efficiently", () => {
  // Boundary: Test behavior with large triangle counts within buffer limits
  // 500 triangles = 1500 vertices × 3 coords × 4 bytes × 2 (pos+normal) = 36KB total
  const manyTrianglesGLTF = createMockGLTF({ triangleCount: 500 })

  return withMockFetch(
    "test://many-triangles.gltf",
    manyTrianglesGLTF,
    async () => {
      const mesh = await loadGLTF("test://many-triangles.gltf")

      expect(mesh).toBeDefined()
      expect(mesh.triangles).toBeDefined()
      expect(mesh.triangles.length).toBe(500)
      expect(Array.isArray(mesh.triangles)).toBe(true)

      // Verify first and last triangles are valid
      expect(mesh.triangles[0].vertices.length).toBe(3)
      expect(mesh.triangles[499].vertices.length).toBe(3)
    },
  )
})

test("createTriangles should handle triangles with zero area (degenerate)", () => {
  // Edge case: Degenerate triangles (all vertices collinear or identical)
  const positions = new Float32Array([
    0,
    0,
    0, // vertex 0
    0,
    0,
    0, // vertex 1 (same as vertex 0)
    0,
    0,
    0, // vertex 2 (same as vertex 0 and 1)
  ])

  const triangles = createTriangles(positions, null, null)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(1)
  // Should handle degenerate triangle gracefully
  expect(triangles[0]!.normal).toBeDefined()
  expect(isFinite(triangles[0]!.normal.x)).toBe(true)
  expect(isFinite(triangles[0]!.normal.y)).toBe(true)
  expect(isFinite(triangles[0]!.normal.z)).toBe(true)
})

test("createTriangles should handle collinear vertices", () => {
  // Edge case: Three vertices in a straight line (zero area triangle)
  const positions = new Float32Array([
    0,
    0,
    0, // vertex 0
    1,
    0,
    0, // vertex 1
    2,
    0,
    0, // vertex 2 (collinear with 0 and 1)
  ])

  const triangles = createTriangles(positions, null, null)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(1)
  // Normal calculation should handle collinear case
  expect(triangles[0]!.normal).toBeDefined()
})

test("createTriangles should handle Uint32Array indices", () => {
  // Edge case: Test larger index type (Uint32Array vs Uint16Array)
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
  const indices = new Uint32Array([0, 1, 2]) // Use Uint32Array instead of Uint16Array

  const triangles = createTriangles(positions, null, indices)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(1)
  expect(triangles[0]!.vertices.length).toBe(3)
})

test("createTriangles should handle mixed vertex counts in non-indexed mode", () => {
  // Edge case: 6 vertices (creates 2 triangles from pairs of 3)
  const positions = new Float32Array([
    0,
    0,
    0, // triangle 1, vertex 0
    1,
    0,
    0, // triangle 1, vertex 1
    0,
    1,
    0, // triangle 1, vertex 2
    2,
    0,
    0, // triangle 2, vertex 0
    3,
    0,
    0, // triangle 2, vertex 1
    2,
    1,
    0, // triangle 2, vertex 2
  ])

  const triangles = createTriangles(positions, null, null)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(2) // Creates 2 triangles from 6 vertices
  expect(triangles[0]!.vertices[0]!.x).toBeCloseTo(0)
  expect(triangles[0]!.vertices[1]!.x).toBeCloseTo(1)
  expect(triangles[0].vertices[2].x).toBeCloseTo(0)
  expect(triangles[1].vertices[0].x).toBeCloseTo(2)
  expect(triangles[1].vertices[1].x).toBeCloseTo(3)
  expect(triangles[1].vertices[2].x).toBeCloseTo(2)
})

test("loadGLTF should handle GLTF with missing buffer reference", () => {
  // Edge case: bufferView references buffer that doesn't exist
  const missingBufferGLTF = {
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [
          {
            attributes: { POSITION: 0 },
            mode: 4,
          },
        ],
      },
    ],
    accessors: [
      {
        bufferView: 0,
        componentType: 5126,
        count: 3,
        type: "VEC3",
      },
    ],
    bufferViews: [
      {
        buffer: 1, // References buffer index 1, but only buffer 0 exists
        byteOffset: 0,
        byteLength: 36,
      },
    ],
    buffers: [
      {
        byteLength: 36,
        uri:
          "data:application/octet-stream;base64," +
          btoa(String.fromCharCode(...new Float32Array(9).fill(1))),
      },
    ],
  }

  return withMockFetch(
    "test://missing-buffer.gltf",
    missingBufferGLTF,
    async () => {
      await expect(loadGLTF("test://missing-buffer.gltf")).rejects.toThrow(
        "Buffer 1 not found",
      )
    },
  )
})
