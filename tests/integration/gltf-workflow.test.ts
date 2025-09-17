import { test, expect } from "bun:test"
import { convertCircuitJsonToGltf } from "../../lib"
import circuitWithGltf from "../fixtures/circuit-with-gltf.json"
import { withMockFetch, createMockGLTF } from "../helpers/gltf-test-utils"

test("should export circuit with GLTF models to valid GLTF 2.0", async () => {
  // Test basic GLTF 2.0 structure and format compliance
  await withMockFetch("test://mock-model.gltf", createMockGLTF(), async () => {
    const result = await convertCircuitJsonToGltf(circuitWithGltf as any, {
      boardTextureResolution: 512,
    })

    expect(result).toBeDefined()
    expect(typeof result).toBe("object")

    const gltf = result as any
    expect(gltf.asset).toBeDefined()
    expect(gltf.asset.version).toBe("2.0")
  })
})

test("should include required GLTF components in export", async () => {
  // Test presence of all required GLTF components
  await withMockFetch("test://mock-model.gltf", createMockGLTF(), async () => {
    const result = await convertCircuitJsonToGltf(circuitWithGltf as any, {
      boardTextureResolution: 512,
    })

    const gltf = result as any

    // Verify required GLTF components
    expect(gltf.scenes).toBeDefined()
    expect(Array.isArray(gltf.scenes)).toBe(true)
    expect(gltf.scenes.length).toBeGreaterThan(0)

    expect(gltf.nodes).toBeDefined()
    expect(Array.isArray(gltf.nodes)).toBe(true)
    expect(gltf.nodes.length).toBeGreaterThan(0)

    expect(gltf.meshes).toBeDefined()
    expect(Array.isArray(gltf.meshes)).toBe(true)
    expect(gltf.meshes.length).toBeGreaterThan(0)

    expect(gltf.buffers).toBeDefined()
    expect(Array.isArray(gltf.buffers)).toBe(true)
    expect(gltf.buffers.length).toBeGreaterThan(0)

    expect(gltf.bufferViews).toBeDefined()
    expect(Array.isArray(gltf.bufferViews)).toBe(true)
    expect(gltf.bufferViews.length).toBeGreaterThan(0)

    expect(gltf.accessors).toBeDefined()
    expect(Array.isArray(gltf.accessors)).toBe(true)
    expect(gltf.accessors.length).toBeGreaterThan(0)
  })
})

test("should generate valid mesh data with triangles", async () => {
  // Test mesh and geometry data integrity
  await withMockFetch("test://mock-model.gltf", createMockGLTF(), async () => {
    const result = await convertCircuitJsonToGltf(circuitWithGltf as any, {
      boardTextureResolution: 512,
    })

    const gltf = result as any

    // Verify mesh structure
    for (const mesh of gltf.meshes) {
      expect(mesh.primitives).toBeDefined()
      expect(Array.isArray(mesh.primitives)).toBe(true)
      expect(mesh.primitives.length).toBeGreaterThan(0)

      // Verify primitive attributes
      for (const primitive of mesh.primitives) {
        expect(primitive.attributes).toBeDefined()
        expect(primitive.attributes.POSITION).toBeDefined()
        expect(typeof primitive.attributes.POSITION).toBe("number")
        expect(primitive.attributes.POSITION).toBeLessThan(
          gltf.accessors.length,
        )
      }
    }
  })
})

test("should create valid buffer data structures", async () => {
  // Test buffer, buffer view, and accessor relationships
  await withMockFetch("test://mock-model.gltf", createMockGLTF(), async () => {
    const result = await convertCircuitJsonToGltf(circuitWithGltf as any, {
      boardTextureResolution: 512,
    })

    const gltf = result as any

    // Verify buffer data structure
    for (const buffer of gltf.buffers) {
      expect(buffer.byteLength).toBeDefined()
      expect(typeof buffer.byteLength).toBe("number")
      expect(buffer.byteLength).toBeGreaterThan(0)

      // Should have either a URI (data URI or external file) or be a GLB buffer
      if (buffer.uri) {
        expect(typeof buffer.uri).toBe("string")
        expect(buffer.uri.length).toBeGreaterThan(0)
      }
    }

    // Verify buffer views reference valid buffers
    for (const bufferView of gltf.bufferViews) {
      expect(bufferView.buffer).toBeDefined()
      expect(typeof bufferView.buffer).toBe("number")
      expect(bufferView.buffer).toBeLessThan(gltf.buffers.length)

      expect(bufferView.byteLength).toBeDefined()
      expect(typeof bufferView.byteLength).toBe("number")
      expect(bufferView.byteLength).toBeGreaterThan(0)

      expect(bufferView.byteOffset).toBeDefined()
      expect(typeof bufferView.byteOffset).toBe("number")
      expect(bufferView.byteOffset).toBeGreaterThanOrEqual(0)
    }
  })
})

test("should create valid accessor data", async () => {
  // Test accessor data integrity and references
  await withMockFetch("test://mock-model.gltf", createMockGLTF(), async () => {
    const result = await convertCircuitJsonToGltf(circuitWithGltf as any, {
      boardTextureResolution: 512,
    })

    const gltf = result as any

    // Verify accessor data is valid
    for (const accessor of gltf.accessors) {
      expect(accessor.bufferView).toBeDefined()
      expect(typeof accessor.bufferView).toBe("number")
      expect(accessor.bufferView).toBeLessThan(gltf.bufferViews.length)

      expect(accessor.componentType).toBeDefined()
      expect(typeof accessor.componentType).toBe("number")

      expect(accessor.count).toBeDefined()
      expect(typeof accessor.count).toBe("number")
      expect(accessor.count).toBeGreaterThan(0)

      expect(accessor.type).toBeDefined()
      expect(typeof accessor.type).toBe("string")
    }
  })
})

test("should incorporate GLTF components from circuit data", async () => {
  // Test integration of GLTF models from circuit-json input
  await withMockFetch("test://mock-model.gltf", createMockGLTF(), async () => {
    const result = await convertCircuitJsonToGltf(circuitWithGltf as any, {
      boardTextureResolution: 512,
    })

    const gltf = result as any

    // Count how many meshes we have - should be at least 2 (board + GLTF component)
    expect(gltf.meshes.length).toBeGreaterThanOrEqual(2)

    // Verify we have sufficient geometry data to represent both board and components
    const totalTriangleCount = gltf.meshes.reduce(
      (count: number, mesh: any) => {
        return (
          count +
          mesh.primitives.reduce((primCount: number, primitive: any) => {
            const positionAccessor =
              gltf.accessors[primitive.attributes.POSITION]
            return primCount + Math.floor(positionAccessor.count / 3) // 3 vertices per triangle
          }, 0)
        )
      },
      0,
    )

    expect(totalTriangleCount).toBeGreaterThan(0)
  })
})

test("should generate complete scene hierarchy", async () => {
  // Test scene, node, and mesh relationships
  await withMockFetch("test://mock-model.gltf", createMockGLTF(), async () => {
    const result = await convertCircuitJsonToGltf(circuitWithGltf as any, {
      boardTextureResolution: 512,
    })

    const gltf = result as any

    // Verify scene structure
    expect(gltf.scene).toBeDefined()
    expect(typeof gltf.scene).toBe("number")
    expect(gltf.scene).toBeLessThan(gltf.scenes.length)

    const rootScene = gltf.scenes[gltf.scene]
    expect(rootScene).toBeDefined()
    expect(rootScene.nodes).toBeDefined()
    expect(Array.isArray(rootScene.nodes)).toBe(true)

    // Verify all scene nodes reference valid nodes
    for (const nodeIndex of rootScene.nodes) {
      expect(typeof nodeIndex).toBe("number")
      expect(nodeIndex).toBeLessThan(gltf.nodes.length)
    }

    console.log(`✅ End-to-end GLTF export successful:`)
    console.log(`  - Nodes: ${gltf.nodes.length}`)
    console.log(`  - Meshes: ${gltf.meshes.length}`)
    console.log(`  - Buffers: ${gltf.buffers.length}`)
    console.log(`  - Buffer views: ${gltf.bufferViews.length}`)
    console.log(`  - Accessors: ${gltf.accessors.length}`)
  })
})
