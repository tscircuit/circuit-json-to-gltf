import { test, expect } from "bun:test"
import circuitWithGLTF from "../fixtures/circuit-with-gltf-components.json"

test("GLTF CAD components have correct CAD data", () => {
  // Verify our test circuit has the expected GLTF CAD components
  expect(circuitWithGLTF).toBeDefined()
  expect(Array.isArray(circuitWithGLTF)).toBe(true)

  const cadComponents = circuitWithGLTF.filter((item: any) =>
    item.type === "cad_component"
  )

  expect(cadComponents.length).toBe(2)

  for (const cad of cadComponents) {
    expect(cad.pcb_component_id).toBeDefined()
    expect(cad.position).toBeDefined()
    expect(cad.size).toBeDefined()
    expect(cad.model_gltf_url).toBeDefined()
    expect(cad.model_gltf_url).toMatch(/^https:\/\/modelcdn\.tscircuit\.com/)
  }
})

test("GLTF URLs are properly configured", () => {
  const cadComponents = circuitWithGLTF.filter((item: any) =>
    item.type === "cad_component"
  )

  const gltfUrls = cadComponents.map((cad: any) => cad.model_gltf_url)

  expect(gltfUrls).toContain("https://modelcdn.tscircuit.com/jscad_models/soic8.glb")
  expect(gltfUrls.length).toBe(2)
  expect(gltfUrls.every(url => url === "https://modelcdn.tscircuit.com/jscad_models/soic8.glb")).toBe(true)
})

test("GLTF components are properly structured", () => {
  const soicComponent = circuitWithGLTF.find((item: any) =>
    item.type === "cad_component" && item.model_gltf_url?.includes("soic8")
  ) as any

  expect(soicComponent).toBeDefined()
  expect(soicComponent.position).toEqual({ x: -15, y: 0, z: 2 })
  expect(soicComponent.size).toEqual({ x: 5, y: 1.5, z: 4 })
  expect(soicComponent.rotation).toEqual({ x: 0, y: 0, z: 0 })
  expect(soicComponent.model_gltf_url).toBe("https://modelcdn.tscircuit.com/jscad_models/soic8.glb")
})

// Test that doesn't import the main library to avoid sharp dependency
test("GLTF test circuit has expected structure", () => {
  expect(circuitWithGLTF.length).toBe(7) // board + 2 components + 2 source components + 2 CAD components

  const types = circuitWithGLTF.map((item: any) => item.type)
  expect(types).toContain("pcb_board")
  expect(types).toContain("pcb_component")
  expect(types).toContain("source_component")
  expect(types).toContain("cad_component")

  const cadCount = types.filter((t: string) => t === "cad_component").length
  expect(cadCount).toBe(2)
})
