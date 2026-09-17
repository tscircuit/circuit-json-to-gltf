# Right-hand rotation fixture

These snapshots are observations of the exporter, **not correctness assertions**.
The rule is simply: point the right thumb along the positive rotation axis;
positive rotation follows the four curled fingers. The fixed curved arrow
illustrates that positive direction, not the measured exporter motion.
Even a wrong-sign rotation preserves handedness. Mixed-axis Euler order is a
separate issue.

The test-only model has a rounded palm and wrist, one extended thumb, and four
curled fingers. The wrist extends perpendicular to the thumb, from the heel
of a broad palm. Each short finger leaves the opposite palm edge and has three
straight segments with exactly two positive 90-degree bends.
Knuckle caps with one through four pips identify index, middle,
ring, and pinky without a three-finger vector mnemonic. The native thumb points
along +Z and lies on the rotation axis. A blue wrist band provides an off-axis
motion marker.

`handThumbSegment`, `handMarkerCenter`, and `gripFingerPaths` describe the native
geometry in right-handed XYZ millimeters. `orientHandPoint` applies proper
cyclic reorientations: `(x,y,z) -> (z,x,y)` for X, `(y,z,x)` for Y, identity for Z.
Construction assertions cover wrist/thumb perpendicularity, palm attachment,
short finger segments, both right-angle bends, positive arrow curl, proper cyclic
frames, marker geometry, and a stationary thumb under either sign of rotation.

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

Each image pairs zero and requested +90 degrees with identical cameras,
stationary Circuit JSON axes, and a fixed positive-curl arrow. The XY grid is
at Z = -8 mm, below the rotation datum, and is not a PCB.
Captions use `svgToPng` with its bundled font rather than system fonts.

The measured captions use **final GLB vertices** to locate the blue wrist-band
center before and after rotation. After undoing only the fixed glTF world
mapping `(-x,z,y)`, both marker vectors are projected perpendicular to the
positive axis. Their signed angle is
`atan2(axis dot cross(initial, final), dot(initial, final))`.
The outcome is measured, not selected by case name. Baseline X/Y produce -90
degrees while Z produces +90; the fix produces +90 for all three.
Only the second PR asserts that the exported turn agrees with the positive rule.

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
