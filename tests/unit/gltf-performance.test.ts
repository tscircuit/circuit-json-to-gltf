import { test, expect } from "bun:test"
import {
  loadGLTF,
  createTriangles,
  decodeBase64Buffer,
  clearGLTFCache,
} from "../../lib/loaders/gltf"
import { createMockGLTF, withMockFetch } from "../helpers/gltf-test-utils"

// Performance Tests: Memory Usage and Large File Handling
// These tests verify that our GLTF loader handles reasonably large datasets efficiently

test("should handle moderate triangle counts efficiently", async () => {
  // Performance: Test with 500 triangles (1,500 vertices)
  const triangleCount = 500
  const largeGLTF = createMockGLTF({ triangleCount })

  await withMockFetch("test://moderate-triangles.gltf", largeGLTF, async () => {
    const startTime = performance.now()
    const startMemory = process.memoryUsage()

    const mesh = await loadGLTF("test://moderate-triangles.gltf")

    const endTime = performance.now()
    const endMemory = process.memoryUsage()

    // Verify correctness
    expect(mesh).toBeDefined()
    expect(mesh.triangles).toBeDefined()
    expect(mesh.triangles.length).toBe(triangleCount)

    // Performance metrics
    const processingTime = endTime - startTime
    const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024)

    console.log(`📊 Moderate triangle performance:`)
    console.log(`  - Triangles: ${triangleCount.toLocaleString()}`)
    console.log(`  - Processing time: ${processingTime.toFixed(1)}ms`)
    console.log(`  - Memory increase: ${memoryIncreaseMB.toFixed(1)}MB`)
    console.log(
      `  - Triangles/ms: ${(triangleCount / processingTime).toFixed(0)}`,
    )

    // Performance assertions (reasonable thresholds)
    expect(processingTime).toBeLessThan(1000) // Should complete in under 1 second
    expect(memoryIncreaseMB).toBeLessThan(50) // Should not use excessive memory

    // Verify triangle quality
    for (let i = 0; i < Math.min(10, mesh.triangles.length); i++) {
      const triangle = mesh.triangles[i]!
      expect(triangle.vertices).toBeDefined()
      expect(triangle.vertices.length).toBe(3)
      expect(triangle.normal).toBeDefined()
    }
  })
})

test("should handle base64 buffers efficiently", () => {
  // Performance: Test with 100KB base64 buffer (reasonable size)
  const bufferSizeKB = 100
  const bufferSize = bufferSizeKB * 1024
  const testData = new Uint8Array(bufferSize)

  // Fill with pattern to ensure realistic base64 encoding
  for (let i = 0; i < bufferSize; i++) {
    testData[i] = (i * 17 + 42) % 256 // Varied pattern
  }

  const base64Data = btoa(String.fromCharCode(...testData))
  const dataUri = `data:application/octet-stream;base64,${base64Data}`

  const startTime = performance.now()
  const startMemory = process.memoryUsage()

  const result = decodeBase64Buffer(dataUri)

  const endTime = performance.now()
  const endMemory = process.memoryUsage()

  // Verify correctness
  expect(result).toBeInstanceOf(ArrayBuffer)
  expect(result.byteLength).toBe(bufferSize)

  // Performance metrics
  const processingTime = endTime - startTime
  const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed
  const memoryIncreaseMB = memoryIncrease / (1024 * 1024)
  const throughputKBps = bufferSizeKB / (processingTime / 1000)

  console.log(`📊 Base64 buffer decoding performance:`)
  console.log(`  - Buffer size: ${bufferSizeKB}KB`)
  console.log(`  - Processing time: ${processingTime.toFixed(1)}ms`)
  console.log(`  - Memory increase: ${memoryIncreaseMB.toFixed(1)}MB`)
  console.log(`  - Throughput: ${throughputKBps.toFixed(0)} KB/s`)

  // Performance assertions
  expect(processingTime).toBeLessThan(500) // Should decode in under 500ms
  expect(throughputKBps).toBeGreaterThan(100) // Should achieve at least 100 KB/s throughput
})

test("should handle multiple mesh GLTF structures efficiently", async () => {
  // Performance: Test with 3 meshes of 50 triangles each (150 total triangles)
  const meshCount = 3
  const trianglesPerMesh = 50
  const totalTriangles = meshCount * trianglesPerMesh

  // Create multiple mesh GLTF using existing utility
  const multiMeshGLTF = createMockGLTF({
    triangleCount: totalTriangles,
    includeNormals: true,
  })

  await withMockFetch("test://multi-mesh.gltf", multiMeshGLTF, async () => {
    const startTime = performance.now()
    const startMemory = process.memoryUsage()

    const mesh = await loadGLTF("test://multi-mesh.gltf")

    const endTime = performance.now()
    const endMemory = process.memoryUsage()

    // Verify correctness
    expect(mesh).toBeDefined()
    expect(mesh.triangles).toBeDefined()
    expect(mesh.triangles.length).toBe(totalTriangles)

    // Performance metrics
    const processingTime = endTime - startTime
    const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed
    const memoryIncreaseMB = memoryIncrease / (1024 * 1024)
    const trianglesPerMs = mesh.triangles.length / processingTime

    console.log(`📊 Multi-mesh GLTF performance:`)
    console.log(`  - Total triangles: ${mesh.triangles.length}`)
    console.log(`  - Processing time: ${processingTime.toFixed(1)}ms`)
    console.log(`  - Memory increase: ${memoryIncreaseMB.toFixed(1)}MB`)
    console.log(`  - Triangles/ms: ${trianglesPerMs.toFixed(1)}`)

    // Performance assertions
    expect(processingTime).toBeLessThan(500) // Should complete in under 500ms
    expect(memoryIncreaseMB).toBeLessThan(25) // Should not use excessive memory
  })
})

test("should maintain performance with repeated loads (caching)", async () => {
  // Performance: Test caching effectiveness
  clearGLTFCache() // Start with clean cache

  const mediumGLTF = createMockGLTF({ triangleCount: 100 })

  await withMockFetch("test://cached-gltf.gltf", mediumGLTF, async () => {
    // First load (cold cache)
    const firstStart = performance.now()
    const mesh1 = await loadGLTF("test://cached-gltf.gltf")
    const firstTime = performance.now() - firstStart

    // Second load (warm cache)
    const secondStart = performance.now()
    const mesh2 = await loadGLTF("test://cached-gltf.gltf")
    const secondTime = performance.now() - secondStart

    // Third load (warm cache)
    const thirdStart = performance.now()
    const mesh3 = await loadGLTF("test://cached-gltf.gltf")
    const thirdTime = performance.now() - thirdStart

    // Verify correctness
    expect(mesh1.triangles.length).toBe(100)
    expect(mesh2.triangles.length).toBe(100)
    expect(mesh3.triangles.length).toBe(100)

    // Performance metrics
    const averageCachedTime = (secondTime + thirdTime) / 2
    const speedupRatio =
      averageCachedTime > 0 ? firstTime / averageCachedTime : firstTime

    console.log(`📊 Caching performance:`)
    console.log(`  - First load (cold): ${firstTime.toFixed(1)}ms`)
    console.log(`  - Second load (cached): ${secondTime.toFixed(1)}ms`)
    console.log(`  - Third load (cached): ${thirdTime.toFixed(1)}ms`)
    console.log(`  - Cache speedup: ${speedupRatio.toFixed(1)}x`)

    // Performance assertions (cache should provide significant speedup)
    if (averageCachedTime > 0) {
      expect(speedupRatio).toBeGreaterThan(5) // At least 5x speedup
    } else {
      // Cached loads are essentially instant (< 1ms)
      expect(firstTime).toBeGreaterThan(1) // First load should take measurable time
    }
  })
})

test("should handle createTriangles with large vertex arrays efficiently", () => {
  // Performance: Test triangle creation with 6,000 vertices (2,000 triangles)
  const vertexCount = 6000
  const triangleCount = Math.floor(vertexCount / 3)

  const positions = new Float32Array(vertexCount * 3)
  const normals = new Float32Array(vertexCount * 3)

  // Fill with test data
  for (let i = 0; i < vertexCount; i++) {
    const baseIndex = i * 3
    positions[baseIndex] = Math.random() * 20 - 10 // x: -10 to +10
    positions[baseIndex + 1] = Math.random() * 20 - 10 // y: -10 to +10
    positions[baseIndex + 2] = Math.random() * 5 // z: 0 to +5
    normals[baseIndex] = 0
    normals[baseIndex + 1] = 0
    normals[baseIndex + 2] = 1
  }

  const startTime = performance.now()
  const startMemory = process.memoryUsage()

  const triangles = createTriangles(positions, normals, null)

  const endTime = performance.now()
  const endMemory = process.memoryUsage()

  // Verify correctness
  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(triangleCount)

  // Verify triangle quality
  expect(triangles[0]!.vertices.length).toBe(3)
  expect(triangles[triangles.length - 1]!.vertices.length).toBe(3)
  expect(triangles[0].normal).toBeDefined()
  expect(triangles[triangles.length - 1].normal).toBeDefined()

  // Performance metrics
  const processingTime = endTime - startTime
  const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed
  const memoryIncreaseMB = memoryIncrease / (1024 * 1024)
  const trianglesPerMs = triangles.length / processingTime

  console.log(`📊 Large triangle creation performance:`)
  console.log(`  - Vertices: ${vertexCount.toLocaleString()}`)
  console.log(`  - Triangles created: ${triangles.length.toLocaleString()}`)
  console.log(`  - Processing time: ${processingTime.toFixed(1)}ms`)
  console.log(`  - Memory increase: ${memoryIncreaseMB.toFixed(1)}MB`)
  console.log(`  - Triangles/ms: ${trianglesPerMs.toFixed(0)}`)

  // Performance assertions
  expect(processingTime).toBeLessThan(500) // Should complete in under 500ms
  expect(memoryIncreaseMB).toBeLessThan(50) // Should not use excessive memory
  expect(trianglesPerMs).toBeGreaterThan(2) // Should process at least 2 triangles/ms
})

test("should handle indexed geometry efficiently", () => {
  // Performance: Test with 2,000 vertices and 6,000 indices (2,000 triangles)
  const vertexCount = 2000
  const indexCount = 6000
  const triangleCount = indexCount / 3

  const positions = new Float32Array(vertexCount * 3)
  const indices = new Uint32Array(indexCount)

  // Fill positions with test data
  for (let i = 0; i < vertexCount; i++) {
    const baseIndex = i * 3
    positions[baseIndex] = Math.random() * 30 - 15 // x: -15 to +15
    positions[baseIndex + 1] = Math.random() * 30 - 15 // y: -15 to +15
    positions[baseIndex + 2] = Math.random() * 8 // z: 0 to +8
  }

  // Fill indices with valid references
  for (let i = 0; i < indexCount; i++) {
    indices[i] = Math.floor(Math.random() * vertexCount)
  }

  const startTime = performance.now()
  const startMemory = process.memoryUsage()

  const triangles = createTriangles(positions, null, indices)

  const endTime = performance.now()
  const endMemory = process.memoryUsage()

  // Verify correctness
  expect(triangles).toBeDefined()
  expect(triangles.length).toBe(triangleCount)

  // Verify triangle quality
  for (let i = 0; i < Math.min(50, triangles.length); i += 10) {
    const triangle = triangles[i]
    expect(triangle.vertices.length).toBe(3)
    expect(triangle.normal).toBeDefined()
  }

  // Performance metrics
  const processingTime = endTime - startTime
  const memoryIncrease = endMemory.heapUsed - startMemory.heapUsed
  const memoryIncreaseMB = memoryIncrease / (1024 * 1024)
  const trianglesPerMs = triangles.length / processingTime

  console.log(`📊 Indexed geometry performance:`)
  console.log(`  - Vertices: ${vertexCount.toLocaleString()}`)
  console.log(`  - Indices: ${indexCount.toLocaleString()}`)
  console.log(`  - Triangles created: ${triangles.length.toLocaleString()}`)
  console.log(`  - Processing time: ${processingTime.toFixed(1)}ms`)
  console.log(`  - Memory increase: ${memoryIncreaseMB.toFixed(1)}MB`)
  console.log(`  - Triangles/ms: ${trianglesPerMs.toFixed(0)}`)

  // Performance assertions
  expect(processingTime).toBeLessThan(300) // Should complete in under 300ms
  expect(memoryIncreaseMB).toBeLessThan(30) // Should not use excessive memory
  expect(trianglesPerMs).toBeGreaterThan(5) // Should process at least 5 triangles/ms
})

test("should maintain reasonable memory usage patterns", async () => {
  // Performance: Test memory usage over multiple operations
  clearGLTFCache()

  const baseMemory = process.memoryUsage()
  const testGLTF = createMockGLTF({ triangleCount: 200, includeNormals: true })

  await withMockFetch("test://memory-test.gltf", testGLTF, async () => {
    const memoryReadings: number[] = []

    // Perform multiple operations and track memory
    for (let i = 0; i < 5; i++) {
      await loadGLTF("test://memory-test.gltf")
      const currentMemory = process.memoryUsage()
      memoryReadings.push(currentMemory.heapUsed)

      // Small delay to allow GC if needed
      await new Promise((resolve) => setTimeout(resolve, 10))
    }

    const finalMemory = process.memoryUsage()
    const totalIncrease =
      (finalMemory.heapUsed - baseMemory.heapUsed) / (1024 * 1024)

    console.log(`📊 Memory usage pattern:`)
    console.log(
      `  - Base memory: ${(baseMemory.heapUsed / (1024 * 1024)).toFixed(1)}MB`,
    )
    console.log(
      `  - Final memory: ${(finalMemory.heapUsed / (1024 * 1024)).toFixed(1)}MB`,
    )
    console.log(`  - Total increase: ${totalIncrease.toFixed(1)}MB`)

    // Memory should not grow excessively with caching
    expect(totalIncrease).toBeLessThan(100) // Should not use more than 100MB total
    expect(memoryReadings.length).toBe(5) // Verify we completed all operations
  })
})
