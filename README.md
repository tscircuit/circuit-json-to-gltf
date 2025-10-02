# circuit-json-to-gltf

Converts circuit JSON to 3D GLTF files. Used for exporting circuits as 3D models.

[Online Playground](https://circuit-json-to-gltf.vercel.app/renderer.html?fixtureId=%7B%22path%22%3A%22CircuitToGltfDemo.fixture.tsx%22%7D&locked=true)

<img width="2424" height="1854" alt="image" src="https://github.com/user-attachments/assets/4ad8b607-e496-449c-88a3-8875b16c0a53" />

## Features

- Convert circuit JSON to GLTF 2.0 format (JSON or binary)
- Render PCB board with accurate dimensions and textures
- Support for STL, OBJ, and GLB model loading for components
- GLB material colors preserved: baseColorFactor (RGB) is mapped to internal materials; alpha is handled via dissolve (1 - alpha)
- High-quality board texture rendering using circuit-to-svg and resvg
- Automatic component positioning and generic 3D representations
- Customizable camera, lighting, and material settings

## Installation

```bash
bun install circuit-json-to-gltf
```

## Usage

```typescript
import { convertCircuitJsonToGltf } from "circuit-json-to-gltf"

// Your circuit JSON data
const circuitJson = {
  elements: [
    {
      type: "pcb_board",
      pcb_board_id: "board1",
      center: { x: 0, y: 0 },
      width: 80,
      height: 60,
      thickness: 1.6
    },
    // ... components, traces, etc.
  ]
}

// Convert to GLTF
const gltf = await convertCircuitJsonToGltf(circuitJson, {
  format: "gltf", // or "glb" for binary
  boardTextureResolution: 2048
})

// Save the result
fs.writeFileSync("circuit.gltf", JSON.stringify(gltf))
```

## API

### Main Function

```typescript
convertCircuitJsonToGltf(circuitJson: CircuitJson, options?: ConversionOptions): Promise<ArrayBuffer | object>
```

### Options

- `format`: "gltf" (JSON) or "glb" (binary) - default: "gltf"
- `boardTextureResolution`: Resolution for board texture rendering - default: 1024
- `includeModels`: Whether to load external 3D models - default: true
- `modelCache`: Map for caching loaded models
- `backgroundColor`: Background color for board rendering
- `showBoundingBoxes`: Show bounding boxes for debugging

## Architecture

The converter uses a modular architecture:

1. **Circuit to 3D Converter**: Parses circuit JSON and creates a 3D scene representation
2. **Board Renderer**: Renders PCB layers as textures using circuit-to-svg and resvg
3. **Model Loaders**: Load STL, OBJ, and GLB files for component 3D models (GLB materials parsed from baseColorFactor)
4. **GLTF Builder**: Constructs the final GLTF using Three.js

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Run example
bun run examples/basic-conversion.ts
```

## Implementation Details

- Uses `circuit-to-svg` to render the top/bottom layers of the board to SVG
- Uses `@resvg/resvg-js` to convert SVG to PNG textures
- Includes built-in STL and OBJ parsers for 3D model loading
- GLB loader parses materials from `gltf.materials[*].pbrMetallicRoughness.baseColorFactor`; it returns an OBJMesh-like shape with `materials` and `materialIndexMap`, and tags triangles with `materialIndex = primitive.material` so per-material primitives are emitted in the final GLTF/GLB.
- Pure GLTF 2.0 implementation without external 3D library dependencies
- Supports both JSON (.gltf) and binary (.glb) formats
- Embeds all assets (textures, buffers) directly in the output
