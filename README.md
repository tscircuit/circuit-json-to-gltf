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

## Folded flex PCBs

```ts
const glb = await convertCircuitJsonToGltf(circuitJson, {
  format: "glb",
  pcbFoldState: "folded", // Default: "flat"
})
```

`pcbFoldState` is also available on `convertCircuitJsonTo3D`. The same Circuit
JSON renders either pose without modifying PCB coordinates or stored CAD poses.
`pcb_bend` uses board-relative `start`/`end`, signed degrees in `bend_angle`, a
neutral-surface `bend_radius` in mm, and `bend_side`. This follows
[circuit-json PR #816](https://github.com/tscircuit/circuit-json/pull/816).
`CircuitJsonWithPcbFlex`, `PcbBendRecord`, and `PcbStiffenerRecord` provide temporary
structural input types until the upstream elements are released.

Bend zones are tessellated at five-degree intervals. Copper/silkscreen textures
retain flat UV coordinates and their original top/bottom surface identity. CAD
models and rectangular/polygon `pcb_stiffener` records follow the board as rigid
objects; model offsets, existing rotations, and layer orientation are preserved.
Standalone CAD objects without a PCB component remain in their original pose.

This first implementation supports a single board with parallel, non-overlapping
bend zones sharing a moving direction, with angles between -180 and 180 degrees.
Each centerline must span the full board cross-section throughout its bend zone.
Bends compose in geometric order, independent of record order. Panels, multiple
boards, conflicting references, partial-width bends, and rigid objects intersecting
bend zones are rejected. Self-collision and manufacturing-rule checks are not
implemented. A bend radius must exceed half the board thickness.

### Three-disc capsule example

The [fixture](examples/three-disc-flex.ts) has three 12 mm circular areas joined
by 2.5 mm flex links, with FR4 backing and CAD components. Four 90-degree bends
(two U-shaped links, with opposite signs for the second pair) align the discs
at heights 0, 6, and 12 mm. The middle disc is inverted. The links extend beyond
the disc edges, so the capsule bore must accommodate the links as well as the discs.
These dimensions demonstrate geometry, not a fabrication-qualified stackup.

```sh
bun examples/render-three-disc-flex.ts out/three-disc-flex
```

This writes flat/folded GLBs, PNG previews, and the source Circuit JSON. The
Cosmos fixture **Three-disc capsule flex** includes a PCB pose selector; select
Flat or Folded and click Convert to GLTF to switch the exported pose.
