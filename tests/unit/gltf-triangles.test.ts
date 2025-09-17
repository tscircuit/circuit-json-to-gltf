import { test, expect } from "bun:test"
import type { Point3, Triangle } from "../../lib/types"
import { createTriangles } from "../../lib/loaders/gltf"

test("should create triangle from 3 position vectors", () => {
    // Test 2.1: Non-indexed Triangles
    // Input: [0,0,0, 1,0,0, 0,1,0] → Output: 1 Triangle with correct vertices
    const positions = new Float32Array([
      0, 0, 0,  // vertex 0
      1, 0, 0,  // vertex 1
      0, 1, 0   // vertex 2
    ])

    const triangles = createTriangles(positions, null, null)

    expect(triangles).toBeDefined()
    expect(triangles.length).toBe(1)

    const triangle = triangles[0]!
    expect(triangle.vertices).toBeDefined()
    expect(triangle.vertices.length).toBe(3)
    expect(triangle.normal).toBeDefined()

    // Verify vertex positions
    expect(triangle.vertices[0].x).toBe(0)
    expect(triangle.vertices[0].y).toBe(0)
    expect(triangle.vertices[0].z).toBe(0)

    expect(triangle.vertices[1].x).toBe(1)
    expect(triangle.vertices[1].y).toBe(0)
    expect(triangle.vertices[1].z).toBe(0)

    expect(triangle.vertices[2].x).toBe(0)
    expect(triangle.vertices[2].y).toBe(1)
    expect(triangle.vertices[2].z).toBe(0)
  })

  test("should create triangle from positions + indices", () => {
    // Test 2.2: Indexed Triangles
    // Input: positions + [0,1,2] indices → Output: correct triangle
    const positions = new Float32Array([
      0, 0, 0,  // index 0
      1, 0, 0,  // index 1
      0, 1, 0,  // index 2
      2, 2, 2   // index 3 (unused)
    ])

    const indices = new Uint16Array([0, 1, 2])

    const triangles = createTriangles(positions, null, indices)

    expect(triangles).toBeDefined()
    expect(triangles.length).toBe(1)

    const triangle = triangles[0]!
    expect(triangle.vertices).toBeDefined()
    expect(triangle.vertices.length).toBe(3)

    // Verify that indices are used correctly
    expect(triangle.vertices[0].x).toBe(0) // positions[0*3]
    expect(triangle.vertices[0].y).toBe(0)
    expect(triangle.vertices[0].z).toBe(0)

    expect(triangle.vertices[1].x).toBe(1) // positions[1*3]
    expect(triangle.vertices[1].y).toBe(0)
    expect(triangle.vertices[1].z).toBe(0)

    expect(triangle.vertices[2].x).toBe(0) // positions[2*3]
    expect(triangle.vertices[2].y).toBe(1)
    expect(triangle.vertices[2].z).toBe(0)
  })

  test("should calculate normals when not provided", () => {
    // Test 2.3: Normal Calculation
    // Input: triangle vertices → Output: calculated normal vector
    const positions = new Float32Array([
      0, 0, 0,  // vertex 0
      1, 0, 0,  // vertex 1
      0, 1, 0   // vertex 2
    ])

    const triangles = createTriangles(positions, null, null)

    expect(triangles).toBeDefined()
    expect(triangles.length).toBe(1)

    const triangle = triangles[0]!
    expect(triangle.normal).toBeDefined()

    // For this triangle, the normal should be (0, 0, 1)
    // This is a triangle in the XY plane facing towards +Z
    expect(triangle.normal.x).toBeCloseTo(0, 5)
    expect(triangle.normal.y).toBeCloseTo(0, 5)
    expect(triangle.normal.z).toBeCloseTo(1, 5)
  })

  test("should use provided normal data from GLTF", () => {
    // Test 2.4: Normal from GLTF Data
    // Input: positions + normals → Output: triangle with GLTF normals
    const positions = new Float32Array([
      0, 0, 0,  // vertex 0
      1, 0, 0,  // vertex 1
      0, 1, 0   // vertex 2
    ])

    const normals = new Float32Array([
      0, 0, -1, // normal for vertex 0 (facing -Z)
      0, 0, -1, // normal for vertex 1 (facing -Z)
      0, 0, -1  // normal for vertex 2 (facing -Z)
    ])

    const triangles = createTriangles(positions, normals, null)

    expect(triangles).toBeDefined()
    expect(triangles.length).toBe(1)

    const triangle = triangles[0]!
    expect(triangle.normal).toBeDefined()

    // Should use the average of the provided normals: (0, 0, -1)
    expect(triangle.normal.x).toBeCloseTo(0, 5)
    expect(triangle.normal.y).toBeCloseTo(0, 5)
    expect(triangle.normal.z).toBeCloseTo(-1, 5)
  })

// CRITICAL ERROR HANDLING TESTS - Previously Missing
test("should handle null positions input", () => {
  expect(() => createTriangles(null as any, null, null)).toThrow()
})

test("should handle undefined positions input", () => {
  expect(() => createTriangles(undefined as any, null, null)).toThrow()
})

test("should handle empty positions array", () => {
  const emptyPositions = new Float32Array([])
  const triangles = createTriangles(emptyPositions, null, null)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(0)
})

test("should handle positions with incomplete triangle data", () => {
  // Only 2 vertices instead of 3 - should not create any triangles
  const incompletePositions = new Float32Array([0, 0, 0, 1, 0, 0])
  const triangles = createTriangles(incompletePositions, null, null)

  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(0)
})

test("should handle invalid indices array", () => {
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
  const invalidIndices = new Uint16Array([0, 1, 5]) // Index 5 is out of range

  // Should either throw or handle gracefully
  expect(() => {
    const triangles = createTriangles(positions, null, invalidIndices)
    // If it doesn't throw, check that it handles the error gracefully
    if (triangles.length > 0) {
      const triangle = triangles[0]!
      expect(triangle.vertices).toBeDefined()
      expect(triangle.vertices.length).toBe(3)
    }
  }).not.toThrow("Cannot read properties of undefined")
})

test("should handle indices with incomplete triangle data", () => {
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
  const incompleteIndices = new Uint16Array([0, 1]) // Only 2 indices instead of 3

  const triangles = createTriangles(positions, null, incompleteIndices)
  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(0)
})

test("should handle mismatched normals array length", () => {
  const positions = new Float32Array([0, 0, 0, 1, 0, 0, 0, 1, 0])
  const shortNormals = new Float32Array([0, 0, 1]) // Only 1 normal for 3 vertices

  // Should handle gracefully without crashing
  const triangles = createTriangles(positions, shortNormals, null)
  expect(triangles).toBeDefined()

  if (triangles.length > 0) {
    const triangle = triangles[0]!
    expect(triangle.normal).toBeDefined()
    expect(typeof triangle.normal.x).toBe('number')
    expect(typeof triangle.normal.y).toBe('number')
    expect(typeof triangle.normal.z).toBe('number')
  }
})

test("should handle extreme coordinate values", () => {
  // Test with very large and very small numbers
  const extremePositions = new Float32Array([
    -1e6, -1e6, -1e6,    // Very small
    1e6, 1e6, 1e6,       // Very large
    0, 0, 0              // Normal
  ])

  const triangles = createTriangles(extremePositions, null, null)
  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(1)

  const triangle = triangles[0]!
  expect(triangle.vertices[0].x).toBe(-1e6)
  expect(triangle.vertices[1].x).toBe(1e6)
  expect(triangle.normal).toBeDefined()
  expect(isFinite(triangle.normal.x)).toBe(true)
  expect(isFinite(triangle.normal.y)).toBe(true)
  expect(isFinite(triangle.normal.z)).toBe(true)
})

test("should handle NaN and infinite values", () => {
  const invalidPositions = new Float32Array([
    NaN, NaN, NaN,
    Infinity, -Infinity, 0,
    0, 0, 0
  ])

  const triangles = createTriangles(invalidPositions, null, null)
  expect(triangles).toBeDefined()

  if (triangles.length > 0) {
    const triangle = triangles[0]!
    // The function should handle these gracefully and produce some result
    expect(triangle.vertices).toBeDefined()
    expect(triangle.normal).toBeDefined()
  }
})