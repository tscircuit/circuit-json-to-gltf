import { test, expect } from "bun:test"
// Import from the module that will contain our implementation
// This import will fail initially (TDD - test first, then implement)
import { decodeBase64Buffer } from "../../lib/loaders/gltf"

// Test 1.1: Base64 Buffer Decoding (TDD Cycle 1)
test("should decode base64 embedded buffer to ArrayBuffer", () => {
  // Create known test data: Float32Array [1.0, 2.0, 3.0]
  const testFloats = [1.0, 2.0, 3.0]
  const expectedArray = new Float32Array(testFloats)

  // Create proper base64 encoding
  const uint8Array = new Uint8Array(expectedArray.buffer)
  const base64String = btoa(String.fromCharCode(...uint8Array))
  const base64Uri = `data:application/octet-stream;base64,${base64String}`

  // Test the decoding function
  const decodedBuffer = decodeBase64Buffer(base64Uri)

  // Verify it's an ArrayBuffer
  expect(decodedBuffer).toBeInstanceOf(ArrayBuffer)
  expect(decodedBuffer.byteLength).toBe(expectedArray.buffer.byteLength)

  // Convert back to Float32Array and verify values
  const decodedFloats = new Float32Array(decodedBuffer)
  expect(decodedFloats.length).toBe(3)
  expect(decodedFloats[0]).toBeCloseTo(1.0)
  expect(decodedFloats[1]).toBeCloseTo(2.0)
  expect(decodedFloats[2]).toBeCloseTo(3.0)
})

// Error Handling Tests - CRITICAL GAPS IDENTIFIED
test("should throw error for null input", () => {
  expect(() => decodeBase64Buffer(null as any)).toThrow()
})

test("should throw error for undefined input", () => {
  expect(() => decodeBase64Buffer(undefined as any)).toThrow()
})

test("should throw error for empty string input", () => {
  expect(() => decodeBase64Buffer("")).toThrow("Invalid base64 data URI")
})

test("should throw error for non-data URI", () => {
  expect(() => decodeBase64Buffer("http://example.com/file.bin")).toThrow("Invalid base64 data URI")
})

test("should throw error for data URI without base64", () => {
  expect(() => decodeBase64Buffer("data:application/octet-stream,notbase64")).toThrow("Invalid base64 data URI")
})

test("should throw error for invalid base64 content", () => {
  expect(() => decodeBase64Buffer("data:application/octet-stream;base64,invalid@#$%")).toThrow()
})

test("should throw error for malformed data URI", () => {
  expect(() => decodeBase64Buffer("data:;base64,")).toThrow("Invalid base64 data URI")
})

test("should handle empty base64 content", () => {
  const result = decodeBase64Buffer("data:application/octet-stream;base64,")
  expect(result).toBeInstanceOf(ArrayBuffer)
  expect(result.byteLength).toBe(0)
})

test("should handle different media types", () => {
  const testData = new Uint8Array([1, 2, 3])
  const base64String = btoa(String.fromCharCode(...testData))

  // Test different valid media types
  const result1 = decodeBase64Buffer(`data:application/octet-stream;base64,${base64String}`)
  const result2 = decodeBase64Buffer(`data:model/gltf-buffer;base64,${base64String}`)

  expect(result1.byteLength).toBe(3)
  expect(result2.byteLength).toBe(3)
})

test("should handle large base64 data", () => {
  // Test with larger data to ensure no memory issues
  const largeData = new Uint8Array(10000).fill(42)
  const base64String = btoa(String.fromCharCode(...largeData))
  const dataUri = `data:application/octet-stream;base64,${base64String}`

  const result = decodeBase64Buffer(dataUri)
  expect(result.byteLength).toBe(10000)

  const decoded = new Uint8Array(result)
  expect(decoded[0]).toBe(42)
  expect(decoded[9999]).toBe(42)
})