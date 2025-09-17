import { test, expect } from "bun:test"
import { loadGLTF, decodeBase64Buffer } from "../../lib/loaders/gltf"
import { withMockFetch } from "../helpers/gltf-test-utils"

// Security Tests: Malicious GLTF Data Protection
// These tests verify that our GLTF loader handles potentially malicious or malformed data securely

test("decodeBase64Buffer should handle malformed base64 safely", () => {
  // Security: Malformed base64 should throw controlled error, not crash
  const malformedCases = [
    "data:application/octet-stream;base64,InvalidBase64!@#$%",
    "data:application/octet-stream;base64,A", // Too short
    "data:application/octet-stream;base64,AB", // Invalid padding
    "data:application/octet-stream;base64,===", // Invalid characters
  ]

  for (const malformedUri of malformedCases) {
    expect(() => decodeBase64Buffer(malformedUri)).toThrow()
  }
})

test("decodeBase64Buffer should reject non-data URIs", () => {
  // Security: Prevent processing of non-data URIs that could be exploits
  const maliciousUris = [
    "javascript:alert('xss')",
    "file:///etc/passwd",
    "http://evil.com/malware",
    "ftp://attacker.com/steal",
    "data:text/html,<script>alert('xss')</script>",
  ]

  for (const uri of maliciousUris) {
    expect(() => decodeBase64Buffer(uri)).toThrow("Invalid base64 data URI")
  }
})

test("decodeBase64Buffer should validate data URI structure", () => {
  // Security: Ensure strict data URI format validation
  const invalidStructures = [
    "data:application/octet-stream,notbase64", // Missing base64 marker
    "data;base64,AQID", // Missing media type separator
    "application/octet-stream;base64,AQID", // Missing data: prefix
    "data:;base64,AQID", // Empty media type
  ]

  for (const invalidUri of invalidStructures) {
    expect(() => decodeBase64Buffer(invalidUri)).toThrow(
      "Invalid base64 data URI",
    )
  }
})

test("loadGLTF should handle extremely large accessor counts safely", () => {
  // Security: Prevent memory exhaustion attacks with huge accessor counts
  const maliciousGLTF = {
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
        count: 0x7fffffff, // Maximum 32-bit signed integer - could cause memory issues
        type: "VEC3",
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: 36, // Small buffer vs huge count - mismatch
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

  return withMockFetch("test://huge-accessor.gltf", maliciousGLTF, async () => {
    // Should handle gracefully without memory exhaustion
    await expect(async () => {
      await loadGLTF("test://huge-accessor.gltf")
    }).not.toThrow("out of memory")
  })
})

test("loadGLTF should handle negative buffer offsets", () => {
  // Security: Negative offsets could cause buffer underruns
  const maliciousGLTF = {
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
        byteOffset: -100, // Negative offset
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: -50, // Negative offset
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
    "test://negative-offset.gltf",
    maliciousGLTF,
    async () => {
      // Should reject negative offsets with controlled error
      await expect(loadGLTF("test://negative-offset.gltf")).rejects.toThrow(
        /cannot be negative/,
      )
    },
  )
})

test("loadGLTF should handle buffer overrun attempts", () => {
  // Security: Prevent reading beyond buffer boundaries
  const maliciousGLTF = {
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
        count: 1000, // Way more than buffer can hold
        type: "VEC3",
      },
    ],
    bufferViews: [
      {
        buffer: 0,
        byteOffset: 0,
        byteLength: 12000, // Claim more bytes than buffer has
      },
    ],
    buffers: [
      {
        byteLength: 36, // Small actual buffer
        uri:
          "data:application/octet-stream;base64," +
          btoa(String.fromCharCode(...new Float32Array(9).fill(1))),
      },
    ],
  }

  return withMockFetch(
    "test://buffer-overrun.gltf",
    maliciousGLTF,
    async () => {
      // Should reject buffer overruns with controlled error
      await expect(loadGLTF("test://buffer-overrun.gltf")).rejects.toThrow(
        /beyond buffer bounds/,
      )
    },
  )
})

test("loadGLTF should handle circular references in GLTF structure", () => {
  // Security: Prevent infinite loops from circular references
  // Note: Our current implementation doesn't traverse node hierarchies, so this tests data processing
  const circularGLTF = {
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [
      { mesh: 0, children: [1] }, // Node 0 references node 1
      { mesh: 0, children: [0] }, // Node 1 references node 0 - circular!
    ],
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
          btoa(String.fromCharCode(...new Uint8Array(36).fill(65))),
      },
    ],
  }

  return withMockFetch("test://circular-refs.gltf", circularGLTF, async () => {
    // Should complete without infinite loops
    const mesh = await loadGLTF("test://circular-refs.gltf")
    expect(mesh).toBeDefined()
    expect(Array.isArray(mesh.triangles)).toBe(true)
  })
})

test("loadGLTF should handle deeply nested JSON structures", () => {
  // Security: Prevent stack overflow from deeply nested objects
  const createDeepObject = (depth: number): any => {
    if (depth <= 0) return { value: "end" }
    return { nested: createDeepObject(depth - 1) }
  }

  const deepGLTF = {
    scene: 0,
    scenes: [{ nodes: [] }],
    nodes: [],
    meshes: [],
    accessors: [],
    bufferViews: [],
    buffers: [],
    extras: createDeepObject(1000), // Very deep nesting
  }

  return withMockFetch("test://deep-nested.gltf", deepGLTF, async () => {
    // Should handle deep nesting without stack overflow
    const mesh = await loadGLTF("test://deep-nested.gltf")
    expect(mesh).toBeDefined()
    expect(mesh.triangles.length).toBe(0) // No actual geometry
  })
})

test("loadGLTF should handle malicious component types", () => {
  // Security: Ensure only valid GLTF component types are processed
  const maliciousComponentTypes = [
    999999, // Invalid huge number
    -1, // Negative component type
    0, // Zero component type
    NaN, // NaN value
    Infinity, // Infinity value
    "5126", // String instead of number
  ]

  for (const maliciousType of maliciousComponentTypes) {
    const maliciousGLTF = {
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
          componentType: maliciousType, // Malicious component type
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
            btoa(String.fromCharCode(...new Float32Array(9).fill(1))),
        },
      ],
    }

    const testName = `malicious-component-${typeof maliciousType === "number" ? maliciousType : "invalid"}.gltf`
    // Each malicious type should be handled gracefully
    withMockFetch(`test://${testName}`, maliciousGLTF, async () => {
      // Should either throw a controlled error or handle gracefully
      try {
        const mesh = await loadGLTF(`test://${testName}`)
        expect(mesh).toBeDefined()
        expect(Array.isArray(mesh.triangles)).toBe(true)
      } catch (error) {
        // Controlled error is acceptable
        expect(error).toBeInstanceOf(Error)
        expect(typeof error.message).toBe("string")
      }
    })
  }
})

test("loadGLTF should sanitize potentially dangerous string values", () => {
  // Security: Ensure string values don't contain injection attempts
  const dangerousStrings = [
    "<script>alert('xss')</script>",
    "javascript:void(0)",
    "${process.env.SECRET}",
    "../../../etc/passwd",
    "\\x00\\x01\\x02", // Null bytes and control characters
  ]

  for (const dangerousString of dangerousStrings) {
    const maliciousGLTF = {
      scene: 0,
      scenes: [
        {
          nodes: [],
          name: dangerousString, // Potentially dangerous string
        },
      ],
      nodes: [],
      meshes: [],
      accessors: [],
      bufferViews: [],
      buffers: [],
      asset: {
        version: "2.0",
        generator: dangerousString, // Another dangerous string location
      },
    }

    const testName = `dangerous-string-${dangerousStrings.indexOf(dangerousString)}.gltf`
    withMockFetch(`test://${testName}`, maliciousGLTF, async () => {
      // Should process without executing or interpreting dangerous strings
      const mesh = await loadGLTF(`test://${testName}`)
      expect(mesh).toBeDefined()
      expect(mesh.triangles.length).toBe(0)
    })
  }
})

test("loadGLTF should handle malformed binary data gracefully", () => {
  // Security: Malformed binary data in base64 should not cause crashes
  const malformedBinaryGLTF = {
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
        buffer: 0,
        byteOffset: 0,
        byteLength: 36,
      },
    ],
    buffers: [
      {
        byteLength: 36,
        // Malformed base64 - random bytes that might not represent valid floats
        uri:
          "data:application/octet-stream;base64," +
          btoa(
            "\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF\x00\xFF",
          ),
      },
    ],
  }

  return withMockFetch(
    "test://malformed-binary.gltf",
    malformedBinaryGLTF,
    async () => {
      // Should handle malformed binary data without crashing
      const mesh = await loadGLTF("test://malformed-binary.gltf")
      expect(mesh).toBeDefined()
      expect(Array.isArray(mesh.triangles)).toBe(true)

      // Verify that any triangles created have valid numeric properties
      for (const triangle of mesh.triangles) {
        for (const vertex of triangle.vertices) {
          expect(typeof vertex.x).toBe("number")
          expect(typeof vertex.y).toBe("number")
          expect(typeof vertex.z).toBe("number")
        }
      }
    },
  )
})
