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
- `fetch`: Optional scoped model-file fetch, for authenticated or in-memory assets
- `authHeaders`: Optional auth headers for model downloads, e.g. `{ Authorization: "Bearer ..." }`

When a `pcb_board` supplies `solder_mask_color`, the renderer uses it for the
board surface and derives contrasting covered-copper, substrate-edge, and
silkscreen colors. Explicit conversion options take precedence.

## Architecture

### Headless geometry preparation

```ts
import { prepareBoardGeometry } from "circuit-json-to-gltf/geometry"

const prepared = await prepareBoardGeometry({
  circuitJson,
  pcbBoardId: "board1",
  assetContext: { projectBaseUrl, authHeaders },
})
```

This entry shares the exporter's actual CAD loaders, placement helpers and
drilled/cutout board generation. It does not import the root entry, textures,
scene orchestration, or a renderer. Procedural loaders and STEP initialization
are lazy. Node ESM, Bun and bundled browser workers are supported. For STEP in
a browser worker, serve `occt-import-js/dist/occt-import-js.wasm` and pass its
absolute URL as `assetContext.stepWasmUrl`; importing geometry never fetches it.
The package still installs its existing presentation dependencies/peers: this
subpath isolates execution, not installation cost.

The result has `pcbBoardId`, `board`, `components`, and `diagnostics`. Each
component retains its `cadComponentId` and `pcbComponentId`; shared URLs or PCB
owners do not collapse separate CAD occurrences. Available records contain the
existing `STLMesh`/`OBJMesh` (including triangle colors and material maps),
`boardFromMesh`, measured `bounds`, and `topology: "unchecked"`. Material maps
remain Maps; use an explicit Map serializer if replaying presentation data
through JSON. Triangle geometry, bounds and matrices are plain data.

The transform chain is intentionally the current exporter contract:

1. The loader bakes format defaults and embedded glTF node transforms.
2. Existing helpers bake units, model-board-normal alignment, explicit/inferred
   origin, and `contain_within_bounds`/`fill_bounds` fitting into mesh vertices.
3. `boardFromMesh` applies the remaining legacy CAD rotation and maps the
   intermediate Y-up mesh into **board-centered XYZ, Z-up, millimetres**, with
   Z=0 at the board midplane. Its translation subtracts the board's world center
   before adding small mesh offsets. Bounds are measured on every placed vertex.

These are loader-normalized vertices, **not native asset coordinates**. The
matrix is column-major, double precision, and authoritative; there are no
competing public Euler/position/size fields. Its Y/Z swap is a reflection:
consumers baking it reverse triangle indices when
`(det(boardFromMesh) < 0) !== !!triangle.windingReversed`. The optional flag
records reflection parity already baked by loaders without reordering vertices
(including glTF node scales), so simply reversing for the final matrix alone
would turn an outward JSCAD body inside-out. This tracks introduced transforms,
not source mesh validity. Derive solid normals from the final winding; legacy
render normals and rendering order are retained unchanged. The
exporter's final glTF X mirror is a separate presentation conversion. The
native-vertex placement utility is deliberately not applied to already
normalized loader output.

Supported sources are OBJ, STL, GLB, glTF, STEP, JSCAD plans and footprinter
models, with the same priority and normalization as export. Unrecognized or
empty sources return `status: "unavailable"` without placeholder geometry.
Fetch/parse failures reject preparation. Only the scene exporter retains its
existing logged GLB/STEP visual-placeholder policy. Authenticated loads bypass
the shared URL-only caches; unauthenticated caches contain unplaced geometry.
`assetContext.fetch` forwards an existing platform fetch without exposing its
owning application. It handles all model requests, including glTF external
buffers, and also bypasses shared caches. Its timeout signal and optional auth
headers are forwarded. The callback is never copied into prepared output.
This hook does not initialize or configure STEP WASM; browser STEP still needs
the explicit runtime asset URL described above.
Render availability does **not** certify a closed Boolean solid or analytic CAD
precision. Mechanical consumers must validate the tessellation and visibly
handle unsuitable/open geometry.

Board selection follows explicit IDs and serialized subcircuit ancestry, never
names or spatial proximity. Single-board legacy records without ownership are
accepted; ambiguous multi-board records and panel/carrier preparation are
rejected. `do_not_place` components are excluded; an owned component permitted
to extend off-board remains included. Board bounds describe the generated
outline rather than an unrelated authored rectangle.
`resolveGeometryBoardId(circuitJson, element)` exposes the same ownership
resolution for consumers associating apertures or PCB owners without CAD.
It returns the board ID, or `undefined` for unresolved ownership. Single-board
fallback applies only when no subcircuit ancestry was supplied, never when an
explicit ancestry chain fails to reach a board.

`supplementalModelMetadata.byCadComponentId` can supply missing origin,
normal, fit and unit fields. Defined Circuit JSON fields win (including zero);
contradictions are reported in `diagnostics` without replacing canonical facts.
`excludedCadComponentIds` and `excludedPcbComponentIds` prevent generated
enclosure/hardware geometry from being re-ingested on subsequent solves.

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
