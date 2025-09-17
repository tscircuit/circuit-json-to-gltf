/**
 * Test utilities for GLTF-related tests
 * Provides reusable mock data and setup functions to reduce test complexity
 */

export interface MockGLTFOptions {
  triangleCount?: number
  includeNormals?: boolean
  useIndices?: boolean
  coordinateSystem?: "origin" | "offset" | "extreme"
}

export interface MockFetchOptions {
  shouldFail?: boolean
  errorMessage?: string
  delay?: number
}

/**
 * Creates a simple GLTF structure for testing
 */
export function createMockGLTF(options: MockGLTFOptions = {}): any {
  const {
    triangleCount = 1,
    includeNormals = true,
    useIndices = false,
    coordinateSystem = "origin",
  } = options

  // Generate vertex positions based on coordinate system
  const positions: number[] = []
  const normals: number[] = []

  for (let t = 0; t < triangleCount; t++) {
    let baseX = 0,
      baseY = 0,
      baseZ = 0

    switch (coordinateSystem) {
      case "offset":
        baseX = t * 2
        baseY = t * 2
        baseZ = t * 2
        break
      case "extreme":
        baseX = t * 1e6
        baseY = t * 1e6
        baseZ = t * 1e6
        break
    }

    // Triangle vertices (triangle fan pattern)
    positions.push(
      baseX + 0,
      baseY + 0,
      baseZ + 0, // vertex 0
      baseX + 1,
      baseY + 0,
      baseZ + 0, // vertex 1
      baseX + 0.5,
      baseY + 1,
      baseZ + 0, // vertex 2
    )

    if (includeNormals) {
      // Normal pointing in +Z direction for all vertices
      normals.push(
        0,
        0,
        1, // normal 0
        0,
        0,
        1, // normal 1
        0,
        0,
        1, // normal 2
      )
    }
  }

  // Create binary data
  const positionArray = new Float32Array(positions)
  const normalArray = includeNormals ? new Float32Array(normals) : null

  // Calculate buffer layout
  const positionBufferLength = positionArray.byteLength
  const normalBufferLength = normalArray ? normalArray.byteLength : 0
  const totalBufferLength = positionBufferLength + normalBufferLength

  // Create combined buffer
  const combinedBuffer = new ArrayBuffer(totalBufferLength)
  new Uint8Array(combinedBuffer).set(new Uint8Array(positionArray.buffer), 0)
  if (normalArray) {
    new Uint8Array(combinedBuffer).set(
      new Uint8Array(normalArray.buffer),
      positionBufferLength,
    )
  }

  // Build accessors array
  const accessors: any[] = [
    {
      bufferView: 0,
      componentType: 5126, // FLOAT
      count: positions.length / 3,
      type: "VEC3",
    },
  ]

  // Build buffer views array
  const bufferViews: any[] = [
    {
      buffer: 0,
      byteOffset: 0,
      byteLength: positionBufferLength,
    },
  ]

  // Add normal accessor and buffer view if needed
  if (includeNormals) {
    accessors.push({
      bufferView: 1,
      componentType: 5126, // FLOAT
      count: normals.length / 3,
      type: "VEC3",
    })

    bufferViews.push({
      buffer: 0,
      byteOffset: positionBufferLength,
      byteLength: normalBufferLength,
    })
  }

  // Build primitive attributes
  const attributes: any = { POSITION: 0 }
  if (includeNormals) {
    attributes.NORMAL = 1
  }

  // Build indices if requested
  let primitiveData: any = {
    attributes,
    mode: 4, // TRIANGLES
  }

  if (useIndices) {
    // Create simple sequential indices
    const indices = []
    for (let i = 0; i < positions.length / 3; i++) {
      indices.push(i)
    }

    // This is a simplified example - real implementation would need index buffer
    primitiveData.indices = accessors.length
    // Add index accessor and buffer view (simplified for test utility)
  }

  // Create base64 data URI - use safe approach to avoid stack overflow
  const uint8Array = new Uint8Array(combinedBuffer)
  let base64Data: string

  // For reasonable sizes, use direct conversion
  if (uint8Array.length <= 65536) {
    // 64KB limit to avoid stack overflow
    base64Data = btoa(String.fromCharCode(...uint8Array))
  } else {
    // For very large buffers, we need a different approach
    // But for our test cases, we'll keep data sizes reasonable
    throw new Error(
      `Buffer size ${uint8Array.length} too large for test utility. Use smaller triangle counts.`,
    )
  }

  return {
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0 }],
    meshes: [
      {
        primitives: [primitiveData],
      },
    ],
    accessors,
    bufferViews,
    buffers: [
      {
        byteLength: totalBufferLength,
        uri: `data:application/octet-stream;base64,${base64Data}`,
      },
    ],
  }
}

/**
 * Creates a mock fetch function that returns GLTF data
 */
export function createMockFetch(
  url: string,
  gltfData: any,
  options: MockFetchOptions = {},
): (input: string) => Promise<Response> {
  const {
    shouldFail = false,
    errorMessage = "Network error",
    delay = 0,
  } = options

  return async (input: string): Promise<Response> => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay))
    }

    if (input === url) {
      if (shouldFail) {
        throw new Error(errorMessage)
      }

      // If gltfData is a string (not an object), return it as-is (for invalid JSON testing)
      const responseBody =
        typeof gltfData === "string" ? gltfData : JSON.stringify(gltfData)

      return new Response(responseBody, {
        headers: { "Content-Type": "application/json" },
      })
    }
    throw new Error(`Unexpected URL: ${input}`)
  }
}

/**
 * Sets up isolated fetch mocking for a test with automatic cleanup
 * Use this in beforeEach/afterEach or with manual cleanup
 */
export function setupMockFetch(
  url: string,
  gltfData: any,
  options?: MockFetchOptions,
): () => void {
  const originalFetch = globalThis.fetch
  const mockFetch = createMockFetch(url, gltfData, options) as typeof fetch
  globalThis.fetch = mockFetch

  // Return cleanup function
  return () => {
    globalThis.fetch = originalFetch
  }
}

/**
 * Executes a test function with isolated fetch mocking
 * Automatically handles cleanup even if test throws
 */
export async function withMockFetch<T>(
  url: string,
  gltfData: any,
  testFn: () => Promise<T> | T,
  options?: MockFetchOptions,
): Promise<T> {
  const originalFetch = globalThis.fetch

  try {
    const mockFetch = createMockFetch(url, gltfData, options) as typeof fetch
    globalThis.fetch = mockFetch
    return await testFn()
  } finally {
    globalThis.fetch = originalFetch
  }
}

/**
 * Executes a test function with multiple URL mocks
 * Handles complex scenarios where multiple URLs need different responses
 */
export async function withMultipleMockFetch<T>(
  urlMocks: Array<{ url: string; gltfData: any; options?: MockFetchOptions }>,
  testFn: () => Promise<T> | T,
): Promise<T> {
  const originalFetch = globalThis.fetch

  try {
    const mockFetch = async (input: string): Promise<Response> => {
      for (const mock of urlMocks) {
        const mockFetch = createMockFetch(mock.url, mock.gltfData, mock.options)
        try {
          return await mockFetch(input)
        } catch (error) {
          // If this mock doesn't handle the URL, try the next one
          if (
            error instanceof Error &&
            error.message.includes("Unexpected URL")
          ) {
            continue
          }
          throw error
        }
      }
      throw new Error(`No mock found for URL: ${input}`)
    }
    globalThis.fetch = mockFetch as typeof fetch

    return await testFn()
  } finally {
    globalThis.fetch = originalFetch
  }
}

/**
 * Common test data patterns
 */
export const TestGLTFPatterns = {
  SIMPLE_TRIANGLE: createMockGLTF(),
  TRIANGLE_WITH_NORMALS: createMockGLTF({ includeNormals: true }),
  TRIANGLE_WITHOUT_NORMALS: createMockGLTF({ includeNormals: false }),
  MULTIPLE_TRIANGLES: createMockGLTF({ triangleCount: 3 }),
  EXTREME_COORDINATES: createMockGLTF({ coordinateSystem: "extreme" }),
  EMPTY_GLTF: {
    scene: 0,
    scenes: [{ nodes: [] }],
    nodes: [],
    meshes: [],
    accessors: [],
    bufferViews: [],
    buffers: [],
  },
}

/**
 * Common test URLs
 */
export const TestURLs = {
  VALID: "test://valid.gltf",
  INVALID: "test://invalid.gltf",
  NOT_FOUND: "test://notfound.gltf",
  SLOW: "test://slow.gltf",
}
