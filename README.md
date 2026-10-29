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
      thickness: 1.6,
    },
    // ... components, traces, etc.
  ],
}

// Convert to GLTF
const gltf = await convertCircuitJsonToGltf(circuitJson, {
  format: "gltf", // or "glb" for binary
  boardTextureResolution: 2048,
})

// Save the result
fs.writeFileSync("circuit.gltf", JSON.stringify(gltf))
```

## API

### Main Function

```typescript
convertCircuitJsonToGltf(circuitJson: CircuitJson, options?: ConversionOptions): Promise<ArrayBuffer | object>
```

### CAD geometry for physics and solid checks

```typescript
import { loadCadComponentMesh } from "circuit-json-to-gltf"

const mesh = await loadCadComponentMesh(cadComponent, {
  pcbComponent, // Optional PCB context for mounting-layer defaults.
})
// mesh.positions: [x, y, z, ...] in Circuit JSON world coordinates, +Z up, mm.
// mesh.indices: outward counter-clockwise triangle indices.
```

The loader shares the renderer's model, origin, scale and mounting rules. It
loads the actual geometry without creating a board or textures. Supply the
resolved assembled CAD pose for folded designs. Missing, failed and empty
models throw; open surfaces remain open for the caller's solid validation.
Model-loading options `projectBaseUrl`, `authHeaders` and `coordinateTransform`
are also supported. Indexed vertices retain their coordinates without snapping.

### Assembly explosion stages

`cad_explosion_stage` and `cad_explosion_move` records describe a playback program.
Exports remain assembled by default. Select a pose with the `explosion` option:

```typescript
import {
  convertCircuitJsonToGltf,
  getAssemblyExplosionFrames,
} from "circuit-json-to-gltf"

const halfway = await convertCircuitJsonToGltf(circuitJson, {
  format: "glb",
  explosion: { throughStageRef: "DEVICE.lift-cover", stageProgress: 0.5 },
})

// Assembled, then every completed stage in declared order. Keep one camera
// across these GLBs and label each image with frame.name for a storyboard.
for (const frame of getAssemblyExplosionFrames(circuitJson)) {
  const glb = await convertCircuitJsonToGltf(circuitJson, {
    format: "glb",
    explosion: frame.explosion,
  })
  // Save/render glb and label it with frame.name.
}
```

`explosion: {}` finishes all stages. Progress divides the selected stage into its
ordered moves, retaining all earlier displacement. A stage target expands its
explicit CAD/reference-surface membership; overlapping targets move once per
instruction. All references, orders and memberships are validated even when
selecting an early pose. The assembled input is never mutated.

Frames also include evaluated `circuitJson` and guide `lines` in circuit-world
XYZ (mm, right-handed +X right, +Y top, +Z above). Evaluated poses omit explosion
instructions to prevent applying them twice after saving. The usual exporter
converts these positions to glTF +Y-up coordinates. Node and browser entry points
support the same program, including assemblies without a PCB.

Each export is a static pose, not a glTF animation track. Playback supports CAD
and reference-surface translations; PCB/cable movement, rotation instructions
and swept collision checking are not supported.

### Options

- `explosion`: Optional `{ throughStageRef?, stageProgress? }` selecting a serialized assembly pose; omitted means assembled.
- `format`: "gltf" (JSON) or "glb" (binary) - default: "gltf"
- `boardTextureResolution`: Resolution for board texture rendering - default: 1024
- `showPcbNotes`: Include `pcb_note*` elements in board texture rendering (default: `false`)
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
- `showReferenceSurfaces`: Render `cad_reference_surface` records as translucent rectangles with outlines, outward normal arrows, and `PART.surface` labels (default: `false`). Explicit width/height are respected; frames without extents use a 10 mm diagnostic rectangle. Works without an owner CAD model.
- `showBoundingBoxes`: Show bounding boxes for debugging (default: `false`)
- `projectBaseUrl`: Optional base URL used to resolve `node_modules` model assets via `/package_files/download`
- `authHeaders`: Optional auth headers for model downloads, e.g. `{ Authorization: "Bearer ..." }`

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

### Component metadata

Both glTF and GLB exports preserve component names as node `name` values and
include lightweight identity in component node `extras.tscircuit`:

```json
{
  "cad_component_id": "cad_component_1",
  "source_component_id": "source_component_1",
  "pcb_component_id": "pcb_component_1",
  "componentName": "U1"
}
```

Only available fields are serialized. Each CAD instance keeps its own identity,
including when instances share a mesh or source component. This allows a viewer
to show names, hide components, and navigate to a schematic from a pre-rendered
GLB without embedding the complete Circuit JSON. Existing extras, such as
`poppygl.showHiddenEdges`, are preserved alongside the metadata.
