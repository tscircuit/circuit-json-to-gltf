---
description: Use Bun instead of Node.js, npm, pnpm, or vite.
globs: "*.ts, *.tsx, *.html, *.css, *.js, *.jsx, package.json"
alwaysApply: false
---

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` for running scripts
- Bun automatically loads .env, so don't use dotenv.

## Testing

Use `bun test` to run tests.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

## Coordinate frames — read before changing any transform

The authoritative ordering is [docs/geometry-pipeline.md](docs/geometry-pipeline.md),
using `3d-viewer` as the geometric-order/rotation reference, not a placement-policy
oracle. Keep local preparation and world placement in the same canonical frame;
convert only at the export boundary.

| Frame | Up | Units |
| --- | --- | --- |
| Circuit JSON (input) | **+Z** | mm |
| Canonical local meshes / Scene3D world | **+Z** | mm |
| glTF / GLB scene (output) | **+Y** | mm |

Consequences that are easy to get wrong:

- Authored CAD rotation is right-handed intrinsic XYZ: `Rx * Ry * Rz`.
  `transformMesh` must not swap axes or negate angles. Loaders normalize assets
  into canonical local space; `convertMeshToGLTFOrientation` applies the final
  proper rotation `G=(-P.x,P.z,P.y)` after placement.
- **A layer flip is a rotation, not an inversion.** The exporter's implicit
  bottom-layer fallback is 180° about Y for GLTF/GLB/footprinter and X otherwise:
  exactly two
  components invert. Negating all three would be an improper transform
  (determinant −1) and would render the part as its own mirror image — which
  looks plausible on a symmetric footprint and wrong on every other one.
- The canonical vertex order is asset nodes, loader normalization, unit scale,
  board-normal rotation, datum subtraction, fit, authored rotation, position,
  then final export basis.
- **Preserve upstream exporter policy.** Explicit origins take precedence;
  otherwise alignment tags select contact-patch or full-bounds centering.
  Minimum Z / horizontal XY replaces old minimum Y / horizontal XZ.
  Unit scaling still applies to both geometry and size targets; fitting uses
  vertex-tight bounds; footprinter still uses the full preparation path.
  Renderer disagreement alone is not a reason to change these policies.

### Rules

1. **State the frame at every boundary.** Any function or record carrying
   geometry says in its docstring which frame it is in, what the axes mean,
   units (mm), which way is up, and whether the value is a point or a direction
   — a point picks up translation, a direction must not.
2. **Find the reference transform first.** Before writing a transform, find an
   object that already moves the same way and build from the same expression.
   Cite what you copied — file, symbol, branch — in a comment, so a reader can
   check agreement without re-deriving the geometry.
3. **Composition order is load-bearing.** Reflections and rotations do not
   commute (`F·R(θ) = R(−θ)·F`), so a wrong order is not cosmetic: it inverts
   results at some angles and not others.
4. **Validate a convention before copying it.** Several transforms here are
   compensations for bugs elsewhere. Before matching one, find its origin commit
   or the test that pins it, and prefer removing the compensation at its source.

`front` and `back` are retired as direction names ecosystem-wide: this package
treated front as +Y while `3d-viewer`'s `Front` camera preset is −Y, and that
disagreement caused most of the defects in this area. Name the axis outright.

Read the canonical pipeline document before adding another format-specific
rotation table; do not compensate for placement errors in a loader.

### Testing geometry

- Derive expectations from **where geometry actually lands**, not from the
  transform. A test that restates the implementation pins its bugs too.
- Make probes discriminating: a marker at `x = 0` cannot detect an X mirror, and
  90°/270° rotations cannot distinguish a wrong mirror axis. Use off-axis
  markers, and cover 0°/180° **and** 90°/270°, on both layers.
- **Never blind-rebaseline a snapshot.** Look at the image. A rebaseline here
  once silently disabled the regression guard its own test comment described.
