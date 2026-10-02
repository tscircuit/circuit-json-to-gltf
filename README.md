# circuit-json-to-gltf

Converts circuit JSON to 3D GLTF files. Used for exporting circuits as 3D models.

[Online Playground](https://circuit-json-to-gltf.vercel.app/renderer.html?fixtureId=%7B%22path%22%3A%22CircuitToGltfDemo.fixture.tsx%22%7D&locked=true)

[![npm version](https://img.shields.io/npm/v/circuit-json-to-gltf.svg)](https://www.npmjs.com/package/circuit-json-to-gltf)

<img width="2424" height="1854" alt="image" src="https://github.com/user-attachments/assets/cb0862aa-2034-4d06-abcc-9a4d1e5a6041" />

## Features

- Convert circuit JSON to GLTF 2.0 format (JSON or binary)
- Render PCB board with accurate dimensions and textures
- Support for STL and OBJ model loading for components
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
- `showPcbNotes`: Include `pcb_note*` elements in board texture rendering (default: `false`)
- `showErrors`: Include complete Circuit JSON error messages (default: `false`), including errors without coordinates. The selected exported scene stores them in `extras.tscircuit.errorMessages`; `convertCircuitJsonTo3D` exposes `Scene3D.errorMessages`. Geometry, materials, bounds, camera, and binary geometry stay unchanged. Use the adapter below to display the messages with released PoppyGL.
- `boardDrillQuality`: Drill geometry detail level, "high" or "fast" - default: "fast"
- `drawFauxBoard`: Draw a fallback board if no `pcb_board` or `pcb_panel` is present - default: false
- `includeModels`: Whether to load external 3D models - default: true
- `modelCache`: Map for caching loaded models
- `backgroundColor`: Board texture background color; overrides `pcb_board.solder_mask_color`
- `boardSideColor`: Physical substrate/edge color; otherwise derived from the solder-mask color
- `copperColor`: Exposed copper color in board textures
- `silkscreenColor`: Silkscreen color in board textures; overrides `pcb_board.silkscreen_color`
- `solderMaskWithCopperColor`: Color of traces and copper covered by solder mask; otherwise derived from the solder-mask color
- `drillColor`: Drill opening color in board textures
- `showBoundingBoxes`: Show bounding boxes for debugging (default: `false`)
- `projectBaseUrl`: Optional base URL used to resolve `node_modules` model assets via `/package_files/download`
- `authHeaders`: Optional auth headers for model downloads, e.g. `{ Authorization: "Bearer ..." }`

### Displaying errors with PoppyGL

PoppyGL 0.0.29 can display these errors through its existing debug labels. It
does not read the error metadata automatically: forward the options returned by
`getPoppyglErrorOverlayOptions` using the same camera and image dimensions as
the render. The adapter is also exported from both browser entry points.

```typescript
import { getPoppyglErrorOverlayOptions } from "circuit-json-to-gltf"
import {
  buildCamera,
  createSceneFromGLTF,
  encodePNG,
  loadGLTFWithResourcesFromURL,
  renderSceneFromGLTF,
  resolveRenderOptions,
} from "poppygl"

// Load the URL of a GLB exported with showErrors: true.
const { gltf, resources } = await loadGLTFWithResourcesFromURL(glbUrl)
const scene = createSceneFromGLTF(gltf, resources)
const options = resolveRenderOptions({
  width: 800,
  height: 600,
  up: "y+",
  debugFontSize: 20,
  debugLabelColor: [160, 0, 35],
  debugPointColor: [160, 0, 35],
})
const camera = buildCamera(
  scene.drawCalls,
  options.width * options.supersampling,
  options.height * options.supersampling,
  options.fov,
  options.camPos,
  options.lookAt,
  options.up,
  options.cameraRotation,
)
const errors = getPoppyglErrorOverlayOptions(gltf, camera, {
  width: options.width,
  height: options.height,
  supersampling: options.supersampling,
  debugFontSize: options.debugFontSize ?? undefined,
})
const { bitmap } = renderSceneFromGLTF(scene, { ...options, ...errors })
const png = await encodePNG(bitmap)
```

The adapter places wrapped labels at the top left using screen layout anchors,
without changing the circuit or camera. Recompute it after camera changes. Its
`width`, `height`, and requested `debugFontSize` are final image pixels; it scales
the returned font size for PoppyGL supersampling. Labels use readable ASCII
fallbacks for unsupported punctuation and codepoint text for unsupported Unicode.
If the viewport cannot fit all rows, a count identifies omitted lines; the full
original messages always remain in the metadata.

When a `pcb_board` supplies `solder_mask_color`, the renderer uses it for the
board surface and derives contrasting covered-copper, substrate-edge, and
silkscreen colors. Explicit conversion options take precedence.

## Architecture

The converter uses a modular architecture:

1. **Circuit to 3D Converter**: Parses circuit JSON and creates a 3D scene representation
2. **Board Renderer**: Renders PCB layers as textures using circuit-to-svg and resvg
3. **Model Loaders**: Load STL and OBJ files for component 3D models
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
- Pure GLTF 2.0 implementation without external 3D library dependencies
- Supports both JSON (.gltf) and binary (.glb) formats
- Embeds all assets (textures, buffers) directly in the output
