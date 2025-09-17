import { test, expect } from "bun:test"
import type {
  Triangle,
  GLTFMesh,
  CoordinateTransformConfig,
} from "../../lib/types"
import { loadGLTF } from "../../lib/loaders/gltf"
import { COORDINATE_TRANSFORMS } from "../../lib/utils/coordinate-transform"
import {
  createMockGLTF,
  setupMockFetch,
  TestURLs,
} from "../helpers/gltf-test-utils"

test("should transform GLTF Y-up coordinates to Z-up", async () => {
  // Test 3.1: Y-up to Z-up Conversion using simplified test utilities
  const testGLTF = createMockGLTF({ includeNormals: false })
  const cleanup = setupMockFetch(TestURLs.VALID, testGLTF)

  try {
    // Test with Z_UP_TO_Y_UP transform (the STL default)
    const meshWithTransform = await loadGLTF(
      TestURLs.VALID,
      COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP,
    )

    expect(meshWithTransform).toBeDefined()
    expect(meshWithTransform.triangles).toBeDefined()
    expect(meshWithTransform.triangles.length).toBe(1)

    const triangle = meshWithTransform.triangles[0]!

    // Original vertex 2 was (0.5, 1, 0) in Y-up
    // With Z_UP_TO_Y_UP transform: { x: "x", y: "-z", z: "y" }
    // (0.5, 1, 0) → (0.5, -0, 1) = (0.5, 0, 1)
    expect(triangle.vertices[0].x).toBeCloseTo(0)
    expect(triangle.vertices[0].y).toBeCloseTo(0)
    expect(triangle.vertices[0].z).toBeCloseTo(0)

    expect(triangle.vertices[1].x).toBeCloseTo(1)
    expect(triangle.vertices[1].y).toBeCloseTo(0)
    expect(triangle.vertices[1].z).toBeCloseTo(0)

    expect(triangle.vertices[2].x).toBeCloseTo(0.5)
    expect(triangle.vertices[2].y).toBeCloseTo(0) // -z from original = -0
    expect(triangle.vertices[2].z).toBeCloseTo(1) // y from original = 1

    // Test with IDENTITY transform (should preserve original coordinates)
    const meshWithoutTransform = await loadGLTF(
      TestURLs.VALID,
      COORDINATE_TRANSFORMS.IDENTITY,
    )
    const originalTriangle = meshWithoutTransform.triangles[0]!

    expect(originalTriangle.vertices[2].x).toBeCloseTo(0.5)
    expect(originalTriangle.vertices[2].y).toBeCloseTo(1) // Y should be preserved
    expect(originalTriangle.vertices[2].z).toBeCloseTo(0)
  } finally {
    cleanup()
  }
})

test("should calculate correct bounding box after transformation", async () => {
  // Test 3.2: Bounding Box Calculation using extreme coordinates
  const extremeGLTF = createMockGLTF({ coordinateSystem: "extreme" })
  const cleanup = setupMockFetch(TestURLs.VALID, extremeGLTF)

  try {
    // Test with IDENTITY transform
    const mesh = await loadGLTF(TestURLs.VALID, COORDINATE_TRANSFORMS.IDENTITY)

    expect(mesh.boundingBox).toBeDefined()
    expect(mesh.boundingBox.min).toBeDefined()
    expect(mesh.boundingBox.max).toBeDefined()

    // With extreme coordinates, verify the bounds are reasonable
    expect(mesh.boundingBox.min.x).toBeLessThanOrEqual(mesh.boundingBox.max.x)
    expect(mesh.boundingBox.min.y).toBeLessThanOrEqual(mesh.boundingBox.max.y)
    expect(mesh.boundingBox.min.z).toBeLessThanOrEqual(mesh.boundingBox.max.z)

    // Verify the values are finite numbers
    expect(isFinite(mesh.boundingBox.min.x)).toBe(true)
    expect(isFinite(mesh.boundingBox.min.y)).toBe(true)
    expect(isFinite(mesh.boundingBox.min.z)).toBe(true)
    expect(isFinite(mesh.boundingBox.max.x)).toBe(true)
    expect(isFinite(mesh.boundingBox.max.y)).toBe(true)
    expect(isFinite(mesh.boundingBox.max.z)).toBe(true)

    // Test with coordinate transformation
    const transformedMesh = await loadGLTF(
      TestURLs.VALID,
      COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP,
    )

    expect(transformedMesh.boundingBox).toBeDefined()
    // After transformation, coordinates will change but should still be finite
    expect(isFinite(transformedMesh.boundingBox.min.x)).toBe(true)
    expect(isFinite(transformedMesh.boundingBox.min.y)).toBe(true)
    expect(isFinite(transformedMesh.boundingBox.min.z)).toBe(true)
    expect(isFinite(transformedMesh.boundingBox.max.x)).toBe(true)
    expect(isFinite(transformedMesh.boundingBox.max.y)).toBe(true)
    expect(isFinite(transformedMesh.boundingBox.max.z)).toBe(true)
  } finally {
    cleanup()
  }
})
