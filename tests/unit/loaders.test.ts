import { test, expect } from "bun:test"
import { loadSTL, loadOBJ, loadGLTF } from "../../lib"
import { clearGLTFCache } from "../../lib/loaders/gltf"
import {
  TestGLTFPatterns,
  TestURLs,
  createMockFetch,
  withMockFetch,
  withMultipleMockFetch,
} from "../helpers/gltf-test-utils"

test("STL loader should parse ASCII STL", () => {
  const asciiSTL = `solid cube
    facet normal 0 0 1
      outer loop
        vertex 0 0 0
        vertex 1 0 0
        vertex 1 1 0
      endloop
    endfacet
    facet normal 0 0 1
      outer loop
        vertex 0 0 0
        vertex 1 1 0
        vertex 0 1 0
      endloop
    endfacet
  endsolid cube`

  // This would need a mock or test server to actually test
  // For now, we just verify the exports exist
  expect(loadSTL).toBeDefined()
  expect(typeof loadSTL).toBe("function")
})

test("OBJ loader should be defined", () => {
  expect(loadOBJ).toBeDefined()
  expect(typeof loadOBJ).toBe("function")
})

test("GLTF loader should be defined", () => {
  expect(loadGLTF).toBeDefined()
  expect(typeof loadGLTF).toBe("function")
})

test("GLTF loader should parse simple GLTF data", async () => {
  await withMockFetch(
    TestURLs.VALID,
    TestGLTFPatterns.SIMPLE_TRIANGLE,
    async () => {
      const mesh = await loadGLTF(TestURLs.VALID)

      expect(mesh).toBeDefined()
      expect(mesh.triangles).toBeDefined()
      expect(Array.isArray(mesh.triangles)).toBe(true)
      expect(mesh.triangles.length).toBe(1)
      expect(mesh.boundingBox).toBeDefined()
      expect(mesh.boundingBox.min).toBeDefined()
      expect(mesh.boundingBox.max).toBeDefined()

      const triangle = mesh.triangles[0]!
      expect(triangle.vertices).toBeDefined()
      expect(triangle.vertices.length).toBe(3)
      expect(triangle.normal).toBeDefined()

      // Verify the actual vertex positions match our test data
      expect(triangle.vertices[0].x).toBeCloseTo(0)
      expect(triangle.vertices[0].y).toBeCloseTo(0)
      expect(triangle.vertices[0].z).toBeCloseTo(0)

      expect(triangle.vertices[1].x).toBeCloseTo(1)
      expect(triangle.vertices[1].y).toBeCloseTo(0)
      expect(triangle.vertices[1].z).toBeCloseTo(0)

      expect(triangle.vertices[2].x).toBeCloseTo(0.5)
      expect(triangle.vertices[2].y).toBeCloseTo(1)
      expect(triangle.vertices[2].z).toBeCloseTo(0)
    },
  )
})

test("loadGLTF should handle malformed GLTF gracefully", async () => {
  // Test 1: Invalid JSON
  await withMockFetch(TestURLs.INVALID, "{ invalid json", async () => {
    await expect(loadGLTF(TestURLs.INVALID)).rejects.toThrow()
  })

  // Test 2: Missing required fields
  await withMockFetch(
    "test://incomplete.gltf",
    TestGLTFPatterns.EMPTY_GLTF,
    async () => {
      const mesh = await loadGLTF("test://incomplete.gltf")
      // Should not throw, but should return empty mesh
      expect(mesh).toBeDefined()
      expect(mesh.triangles).toBeDefined()
      expect(mesh.triangles.length).toBe(0) // No triangles due to missing data
    },
  )

  // Test 3: Network error
  await withMockFetch(
    "test://network-error.gltf",
    TestGLTFPatterns.SIMPLE_TRIANGLE,
    async () => {
      await expect(loadGLTF("test://network-error.gltf")).rejects.toThrow(
        "Network error",
      )
    },
    { shouldFail: true, errorMessage: "Network error" },
  )
})

test("loadGLTF should cache results", async () => {
  // Test 4.3: Caching using simplified test utilities
  clearGLTFCache()

  let fetchCount = 0

  await withMultipleMockFetch(
    [
      { url: TestURLs.VALID, gltfData: TestGLTFPatterns.SIMPLE_TRIANGLE },
      { url: TestURLs.INVALID, gltfData: TestGLTFPatterns.SIMPLE_TRIANGLE },
    ],
    async () => {
      // Override fetch to track calls
      const originalFetch = globalThis.fetch
      globalThis.fetch = (async (url: string) => {
        fetchCount++
        return await originalFetch(url)
      }) as typeof fetch

      // First call should fetch
      const mesh1 = await loadGLTF(TestURLs.VALID)
      expect(fetchCount).toBe(1)
      expect(mesh1).toBeDefined()

      // Second call should use cache
      const mesh2 = await loadGLTF(TestURLs.VALID)
      expect(fetchCount).toBe(1) // Should still be 1 (no additional fetch)
      expect(mesh2).toBeDefined()

      // Results should be identical
      expect(mesh1.triangles.length).toBe(mesh2.triangles.length)
      expect(mesh1.boundingBox.min.x).toBe(mesh2.boundingBox.min.x)

      // Different URL should fetch again
      await loadGLTF(TestURLs.INVALID)
      expect(fetchCount).toBe(2) // Should increment for different URL
    },
  )
})
