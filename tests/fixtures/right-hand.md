# Right-hand rotation fixture

These snapshots are observations of the exporter, **not correctness assertions**.
The independent right-hand expectations are +X: +Y to +Z, +Y: +Z to +X, and
+Z: +X to +Y. Positive rotation does not turn a right hand into a left hand:
even a wrong-sign rotation is proper. Mixed-axis Euler order is a separate issue.

The test-only model has a rounded palm and wrist, extended thumb and index,
middle bent out of the palm, and individually curled ring and pinky fingers.
Gold, cyan, and purple identify the distal thumb, index, and middle respectively.
The native hand has index +X, middle +Y, thumb +Z; its palm faces +Y.
`handFingerSegments` exports the colored distal centerline endpoints in native
right-handed XYZ millimeters. `orientHandPoint` applies only proper cyclic
reorientations: `(x,y,z) -> (z,x,y)` for X, `(y,z,x)` for Y, identity for Z.
The construction test checks directions, orthogonality, index cross middle =
thumb, determinant +1, and the actual colored geometry's center.

## Synthetic boundary

The published native generator has no fixture registration API.
`right-hand-preload.ts` replaces **only** `getJscadModelForFootprint` for exactly
`test-only-right-hand-x`, `test-only-right-hand-y`, and `test-only-right-hand-z`.
It delegates all other strings to the captured real generator. No production
vocabulary, dependency, or runtime injection API is added.

The preload runs exclusively in a spawned Bun process. It is never imported by
the main test process or the shared test preload. The production footprinter
loader, JSCAD-to-GLB generation, GLB parser, occurrence transforms, final GLB
builder, and renderer are real. `model_jscad` is not used. Ordinary SOIC8/SOIC14
analytical tests continue to use the unmocked `footprinterCircuit`,
`exportFootprinter`, and `footprinterRotationCases` helpers.

Each image pairs zero and +90 degrees with identical cameras and stationary
Circuit JSON world axes. The grid is the XY datum plane at Z = -6.6 mm, not a
PCB. Only the documented Scene/glTF frame mapping is applied to the reference.
Captions use `svgToPng` and its bundled TscircuitAlphabet font.

The measured captions come from **final GLB vertices**, filtered by finger
color. Each straight colored distal segment extends away from the datum along
its longest axis (checked in the construction test). For these cardinal poses,
its long-axis midpoint sign therefore gives its direction. The measurement
undoes only the fixed glTF world mapping `(-x,z,y)`, never the occurrence rotation.
It neither supplies a corrected pose nor asserts that the exporter is correct.

## Regeneration

From either worktree, after integrating the same fixture source:

```sh
BUN_UPDATE_SNAPSHOTS=1 bun test ./tests/snapshot/footprinter-xyz-rotation.test.ts ./tests/snapshot/right-hand-construction.test.ts
```

For one standalone image (substitute `y` or `z`):

```sh
bun --preload ./tests/fixtures/right-hand-preload.ts ./tests/fixtures/render-right-hand.ts x /tmp/right-hand-x90.png
```

Case/snapshot names: `right-hand-x90`, `right-hand-y90`, `right-hand-z90`.
The same helper must run against each revision's own `lib`; never substitute a
manually rotated image for an export.
