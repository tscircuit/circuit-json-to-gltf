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

This package converts between two frames with **different up axes**, and that
conversion is the single largest source of defects in tscircuit's 3D output.

| Frame | Up | Units |
| --- | --- | --- |
| Circuit JSON (input) | **+Z** | mm |
| glTF / GLB scene (output) | **+Y** | mm |

Consequences that are easy to get wrong:

- A rotation cannot be copied across the boundary. `circuit-to-3d.ts` remaps a
  component's rotation (`y ← cad.rotation.z`, `z ← cad.rotation.y`) precisely
  because of the swap. Any new rotation path needs the same remap, not a
  hand-written variant of it.
- **A layer flip is a rotation, not an inversion.** Flipping a part to the
  bottom layer is a 180° rotation about the vertical axis: exactly two
  components invert. Negating all three would be an improper transform
  (determinant −1) and would render the part as its own mirror image — which
  looks plausible on a symmetric footprint and wrong on every other one.
- Model formats do not agree with each other: a GLB model and a footprinter
  model need different flips for the same bottom-layer part (see the
  `isBottomLayer` branch). Adding a format means deciding this deliberately,
  not copying whichever branch is nearest.

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

The current enclosure/frame contract is documented in the parametric-enclosures
RFC's **Faces** and **Aperture projection** sections. Read those together with
this file before adding another format-specific rotation table; the older
standalone coordinate-frame RFC was retired.

### Testing geometry

- Derive expectations from **where geometry actually lands**, not from the
  transform. A test that restates the implementation pins its bugs too.
- Make probes discriminating: a marker at `x = 0` cannot detect an X mirror, and
  90°/270° rotations cannot distinguish a wrong mirror axis. Use off-axis
  markers, and cover 0°/180° **and** 90°/270°, on both layers.
- **Never blind-rebaseline a snapshot.** Look at the image. A rebaseline here
  once silently disabled the regression guard its own test comment described.
