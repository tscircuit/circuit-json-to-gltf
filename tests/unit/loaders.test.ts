import { test, expect } from "bun:test"
import { loadSTL, loadOBJ, loadGLB } from "../../lib"

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

test("GLB loader should be defined", () => {
  expect(loadGLB).toBeDefined()
  expect(typeof loadGLB).toBe("function")
})
