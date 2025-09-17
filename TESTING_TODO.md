# GLTF Support - TDD Testing Plan

## Overview
This document outlines the Test-Driven Development (TDD) approach for implementing complete GLTF support in circuit-json-to-gltf. Each test should be written to fail first, then implemented with minimal code to pass.

## Repository Testing Structure
- `tests/unit/` - Unit tests for individual functions/modules
- `tests/integration/` - End-to-end integration tests
- `tests/fixtures/` - Test data files
- Test files use `bun:test` framework with `test()` and `expect()`
- Import from `../../lib` for main exports

## TDD Phases

### Phase 1: Core GLTF Parsing (Unit Tests)
**File**: `tests/unit/gltf-core.test.ts`

#### Test 1.1: Base64 Buffer Decoding
```typescript
test("should decode base64 embedded buffer to ArrayBuffer", () => {
  // Test known Float32Array [1.0, 2.0, 3.0] → base64 → decode → verify
})
```
**Implementation**: Create `decodeBase64Buffer()` helper function

#### Test 1.2: Accessor Data Extraction
```typescript
test("should extract Float32Array from GLTF accessor", () => {
  // Test: accessor + bufferView + buffer → Float32Array with expected values
})
```
**Implementation**: Create `extractAccessorData()` function

#### Test 1.3: Component Type Handling
```typescript
test("should handle different componentTypes (FLOAT, UNSIGNED_SHORT, UNSIGNED_INT)", () => {
  // Test each componentType returns correct typed array
})
```

#### Test 1.4: Buffer Layout with Offsets
```typescript
test("should handle bufferView byte offsets correctly", () => {
  // Test: combined buffer with positions at offset 0, normals at offset 36
})
```

### Phase 2: Triangle Creation (Unit Tests)
**File**: `tests/unit/gltf-triangles.test.ts`

#### Test 2.1: Non-indexed Triangles
```typescript
test("should create triangle from 3 position vectors", () => {
  // Input: [0,0,0, 1,0,0, 0,1,0] → Output: 1 Triangle with correct vertices
})
```

#### Test 2.2: Indexed Triangles
```typescript
test("should create triangle from positions + indices", () => {
  // Input: positions + [0,1,2] indices → Output: correct triangle
})
```

#### Test 2.3: Normal Calculation
```typescript
test("should calculate normals when not provided", () => {
  // Input: triangle vertices → Output: calculated normal vector
})
```

#### Test 2.4: Normal from GLTF Data
```typescript
test("should use provided normal data from GLTF", () => {
  // Input: positions + normals → Output: triangle with GLTF normals
})
```

### Phase 3: Coordinate Transformation (Unit Tests)
**File**: `tests/unit/gltf-coordinates.test.ts`

#### Test 3.1: Y-up to Z-up Conversion
```typescript
test("should transform GLTF Y-up coordinates to Z-up", () => {
  // Input: Y-up triangle → Output: Z-up triangle (verify transformation)
})
```

#### Test 3.2: Bounding Box Calculation
```typescript
test("should calculate correct bounding box after transformation", () => {
  // Input: transformed triangles → Output: correct min/max bounds
})
```

### Phase 4: Full GLTF Loading (Unit Tests)
**File**: `tests/unit/loaders.test.ts` (add to existing)

#### Test 4.1: Basic GLTF Structure Parsing
```typescript
test("loadGLTF should parse minimal valid GLTF with one triangle", async () => {
  // Mock fetch with minimal GLTF JSON
  // Verify: 1 triangle, correct vertices, proper GLTFMesh structure
})
```

#### Test 4.2: Error Handling
```typescript
test("loadGLTF should handle malformed GLTF gracefully", async () => {
  // Test: invalid JSON, missing required fields, etc.
})
```

#### Test 4.3: Caching
```typescript
test("loadGLTF should cache results", async () => {
  // Verify same URL returns cached result without re-fetching
})
```

### Phase 5: Pipeline Integration (Integration Tests)
**File**: `tests/integration/circuit-to-gltf.test.ts` (add to existing)

#### Test 5.1: Circuit with GLTF Component
```typescript
test("convertCircuitJsonTo3D should load GLTF models for cad_components", async () => {
  // Input: circuit-json with model_gltf_url
  // Verify: Scene3D with Box3D containing GLTFMesh
})
```

#### Test 5.2: GLTF Model Positioning
```typescript
test("should position GLTF model correctly in 3D scene", async () => {
  // Verify: GLTF model at correct position/rotation/scale
})
```

#### Test 5.3: Fallback Behavior
```typescript
test("should fallback gracefully when GLTF loading fails", async () => {
  // Invalid GLTF URL → component box without mesh (no crash)
})
```

### Phase 6: End-to-End Workflow
**File**: `tests/integration/gltf-workflow.test.ts`

#### Test 6.1: Complete GLTF Export
```typescript
test("should export circuit with GLTF models to final GLTF", async () => {
  // Full pipeline: circuit-json → 3D scene → GLTF export
})
```

## Implementation Order (TDD Cycles)

### Cycle 1: Base64 Decoding
1. Write Test 1.1 (failing)
2. Implement minimal `decodeBase64Buffer()`
3. Make Test 1.1 pass
4. Refactor if needed

### Cycle 2: Accessor Extraction
1. Write Test 1.2 (failing)
2. Implement `extractAccessorData()`
3. Make Test 1.2 pass
4. Refactor

### Cycle 3: Triangle Creation
1. Write Test 2.1 (failing)
2. Implement `createTriangles()`
3. Make Test 2.1 pass
4. Add Test 2.2, implement indices support
5. Refactor

### Cycle 4: GLTF Integration
1. Write Test 4.1 (failing)
2. Wire together base64 → accessor → triangles
3. Make Test 4.1 pass
4. Add caching, error handling

### Cycle 5: Pipeline Integration
1. Write Test 5.1 (failing)
2. Integrate `loadGLTF` into `circuit-to-3d.ts`
3. Make Test 5.1 pass

## Success Criteria

### Unit Tests Pass
- All base64/accessor/triangle functions work correctly
- Coordinate transformations are accurate
- Error handling is robust

### Integration Tests Pass
- GLTF models load in circuit conversion
- Models are positioned correctly
- Fallback behavior works

### Code Quality
- Type safety maintained
- Follows existing patterns (STL/OBJ loaders)
- No breaking changes to existing functionality

## Test Data Requirements

### Minimal GLTF Test File
Create `tests/fixtures/minimal-triangle.gltf`:
- 1 triangle (3 vertices)
- Embedded base64 buffer
- POSITION and NORMAL attributes
- Valid GLTF 2.0 structure

### Circuit Test Data
Create `tests/fixtures/circuit-with-gltf-model.json`:
- Basic circuit with 1 PCB component
- 1 CAD component with `model_gltf_url`
- References minimal GLTF file

## Running Tests

```bash
# Run specific test file
bun test tests/unit/gltf-core.test.ts

# Run all GLTF tests
bun test tests/unit/gltf-*.test.ts tests/integration/*gltf*.test.ts

# Run all tests
bun test
```

## Notes

- Follow existing code patterns in `lib/loaders/stl.ts` and `lib/loaders/obj.ts`
- Use proper TypeScript types - extend existing `STLMesh` interface
- Mock `fetch()` in tests using `globalThis.fetch = mockFunction`
- Use `expect().toBeCloseTo()` for floating point comparisons
- Create proper base64 test data with known binary values