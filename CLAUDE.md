---
description: GLTF Support Implementation for circuit-json-to-gltf
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

# GLTF Support Implementation Guide

## Project Context
Implementing tscircuit #758: Add cadModel.gltfUrl support to circuit-json-to-gltf.
This completes the missing piece of the GLTF pipeline - 5 of 6 tasks already done.

## Architecture Overview

### Current State (83% Complete)
- ✅ tscircuit/props - cadModel interface exists
- ✅ tscircuit/circuit-json - `model_gltf_url` field defined
- ✅ tscircuit/core - Component processing complete
- ✅ tscircuit/3d-viewer - GLTF loader working (Models.stories.tsx)
- ✅ tscircuit/cli - 3D viewer integration complete
- ❌ circuit-json-to-gltf - **THIS IMPLEMENTATION**

### Data Flow
```
cadModel.gltfUrl (props) → model_gltf_url (circuit-json) → loadGLTF() → Triangle[] → GLTF Export
```

## Implementation Strategy

### Custom GLTF Parser Approach
Following project philosophy: "Pure GLTF 2.0 implementation without external 3D library dependencies"

**Rationale**: Project already has custom STL/OBJ parsers, maintaining consistency and avoiding dependencies.

### Integration Pattern
Follow exact same pattern as existing STL/OBJ loaders:
1. Loader function in `/lib/loaders/`
2. Mesh interface in `/lib/types.ts`
3. Geometry conversion in `/lib/gltf/geometry.ts`
4. Pipeline integration in `/lib/converters/circuit-to-3d.ts`

## Files to Implement

### 1. NEW: `/lib/loaders/gltf.ts`
```typescript
export async function loadGLTF(url: string, transform?: CoordinateTransformConfig): Promise<GLTFMesh>
function parseGLTF(gltfJson: any, baseUrl: string): GLTFMesh
function extractMeshData(mesh: any, gltfJson: any, buffers: ArrayBuffer[]): Triangle[]
```

**MVP Features**:
- JSON GLTF format (.gltf files)
- Embedded base64 buffers
- TRIANGLES primitive mode
- POSITION attributes (required)
- NORMAL attributes (generate if missing)

**GLTF Parsing Algorithm**:
1. Load GLTF JSON + resolve embedded buffers
2. For each mesh.primitive: Extract POSITION/NORMAL via accessor → bufferView → buffer
3. Convert to Triangle[] format matching STL/OBJ
4. Apply coordinate transformation (Z_UP_TO_Y_UP)

### 2. MODIFY: `/lib/types.ts`
```typescript
export interface GLTFMesh extends STLMesh {
  // Same structure as STLMesh/OBJMesh
}

export interface Box3D {
  meshType?: "stl" | "obj" | "gltf" // ADD "gltf"
}
```

### 3. MODIFY: `/lib/converters/circuit-to-3d.ts`
**Integration Point**: Lines 97-148

**Current**:
```typescript
const { model_stl_url, model_obj_url } = cad
if (!model_stl_url && !model_obj_url) continue
```

**Updated**:
```typescript
const { model_stl_url, model_obj_url, model_gltf_url } = cad
if (!model_stl_url && !model_obj_url && !model_gltf_url) continue

// Add GLTF loading:
} else if (model_gltf_url) {
  box.mesh = await loadGLTF(model_gltf_url, defaultTransform)
}
```

### 4. MODIFY: `/lib/gltf/geometry.ts`
```typescript
export function createMeshFromGLTF(gltfMesh: GLTFMesh): MeshData {
  // Same pattern as createMeshFromSTL/createMeshFromOBJ
}
```

### 5. MODIFY: `/lib/index.ts`
```typescript
export { loadGLTF, clearGLTFCache } from "./loaders/gltf"
```

## GLTF Technical Details

### GLTF Structure
- **JSON Root**: scenes, nodes, meshes, accessors, bufferViews, buffers
- **Buffers**: Raw binary data (embedded base64 or external)
- **Accessors**: Typed views into buffers (vertices, normals, indices)
- **Primitives**: Triangle lists with material references

### Coordinate System
- GLTF: Y-up right-handed
- Apply: `COORDINATE_TRANSFORMS.Z_UP_TO_Y_UP` (existing pattern)

### Buffer Data Extraction
```typescript
// Extract accessor data from binary buffers
function extractAccessorData(accessorIndex: number, gltfJson: any, buffers: ArrayBuffer[]) {
  const accessor = gltfJson.accessors[accessorIndex]
  const bufferView = gltfJson.bufferViews[accessor.bufferView]
  const buffer = buffers[bufferView.buffer]

  // Handle componentType (FLOAT, UNSIGNED_SHORT, etc.)
  // Apply offset/stride from accessor/bufferView
  // Return typed array of position/normal/index data
}
```

## Testing Strategy

### Unit Tests (`/tests/unit/gltf-loader.test.ts`)
- Parse simple GLTF files
- Handle embedded buffers
- Coordinate transformation
- Error handling

### Integration Tests
- circuit-json with model_gltf_url
- End-to-end GLTF → Triangle[] conversion
- Performance vs STL/OBJ

### Test GLTF Files
Use existing working models from 3d-viewer:
- `./stories/assets/myGltf.gltf`
- Simple geometric shapes for validation

## Development Workflow

### Day 1: Core Parser
1. Implement basic GLTF parser (JSON format only)
2. Add GLTFMesh interface
3. Unit test with simple files

### Day 2: Integration
1. Integrate into circuit-to-3d pipeline
2. Add createMeshFromGLTF function
3. Test end-to-end workflow

### Day 3: Polish & Demo
1. Error handling and edge cases
2. Performance optimization
3. Demo video showing GLTF models in exported scenes

## Success Criteria
- GLTF models load and render correctly in exported scenes
- Performance comparable to STL/OBJ loading
- Clean integration following existing patterns
- Demo video showing end-to-end functionality
- All tests pass

## Error Handling
- Graceful degradation (log errors, continue processing)
- Fallback to generic component box if GLTF loading fails
- Validate GLTF structure and required fields

## Performance Considerations
- Implement caching like STL/OBJ loaders
- Memory-efficient buffer processing
- Stream large GLTF files if needed

Default to using Bun instead of Node.js.
- Use `bun test` to run tests
- Use `bun run <script>` for scripts
- Use `bun install` for dependencies