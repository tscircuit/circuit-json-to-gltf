# Canonical geometry pipeline

The canonical local and world frames are **right-handed, Z-up, millimeters**:
the PCB is in XY and +Z leaves its top surface. Asset coordinates are normalized
once; CAD placement never depends on the output renderer's axes.

The geometric operation-order and authored-rotation reference is `3d-viewer` at
[`813b936`](https://github.com/tscircuit/3d-viewer/tree/813b936):
`src/utils/cad-model-transform.ts`, `src/utils/cad-model-fit.ts`, and
`src/three-components/useCadModelTransformGraph.ts`. The order below is
canonical, but **the exporter's existing origin, sizing and placement policies
are retained**. Viewer agreement is evidence about transforms, not a reason to
replace those policies. Changing a policy needs a separate decision.

## Frames and ownership

| Boundary | Owner | Contract |
| --- | --- | --- |
| Asset nodes to normalized local geometry | `lib/loaders/` | Flatten the active asset hierarchy, then apply format normalization. |
| Units, board normal, datum, fit | `circuit-to-3d.ts`, `cad-mesh-placement.ts` | Prepare canonical local geometry without applying CAD world rotation or translation. |
| Canonical local to project world | `transformMesh` | Right-handed intrinsic XYZ placement, then world translation. |
| Project world to exported glTF | `GLTFBuilder`, `convertMeshToGLTFOrientation` | One fixed proper basis conversion, equally applied to geometry and node translation. |

`Scene3D`, `Box3D.center`, `Box3D.size`, board/panel meshes, and CAD meshes now
use canonical XYZ. The old intermediate Y/Z-swapped scene is gone. Direct
callers of `convertCircuitJsonTo3D` or `convertSceneToGLTF` must use this new
contract; do not pre-swap their coordinates. Mesh bounds describe actual
vertices in that mesh's current frame.

Inputs that rely on contact-centering still receive it. The TO-92 regression
does not need a newly authored midpoint, and missing positions still use the
exporter's generated placement rather than the viewer's zero-position default.

Loaders initially retain numeric asset units. Unit conversion is the explicit
stage below. Neither a `.gltf` suffix nor a `.glb` container implicitly adds
a factor of 1000; this matches the viewer's existing asset conventions.

## Canonical operation order

With column vectors, the common model path is:

```text
p_world = T(position) * R_XYZ(cad.rotation) * F(fit)
        * T(-datum) * B * S(unitScale) * L * N * p_asset
```

Applied to a vertex, from first to last:

1. **Asset hierarchy `N`:** mesh-local node, then its parents. Preserve each
   active node instance, quaternion/TRS or node matrix, including translations.
2. **Loader normalization `L`:** the format-specific local-space transform.
   It is not the final glTF export transform.
3. **Unit conversion `S`:** `model_unit_to_mm_scale_factor`, default 1.
4. **Board-normal orientation `B`:** rotate the normalized model so the declared
   native model axis, transformed through `L`, points toward project +Z.
5. **Datum policy:** an explicit origin takes precedence; otherwise infer the
   origin using the existing alignment policy described below.
6. **Fit `F`:** fit in these local axes, including scaling the datum translation.
7. **Authored CAD rotation:** intrinsic XYZ, with degrees converted to radians.
8. **CAD position:** translate in project world coordinates.
9. **Export basis:** convert the completed world placement to glTF coordinates.

An explicit origin is transformed by `B * L` but **not multiplied by unit
scale**, preserving the exporter's existing behavior.
For an identity loader and board orientation, point `(4,5,6)`, unit scale 2,
and origin `(1,2,3)` produce `(7,8,9)` before fitting, not `(6,6,6)`.

`transformMesh` exposes scale, rotation and translation for canonical meshes.
In the circuit pipeline the preparation stages have already baked the model
scale/fit. The builder bakes rotation but retains translation on the glTF node
to allow translated instances to share geometry. Applying the same export
basis to the mesh and that translation is algebraically equivalent to
converting the complete world-space mesh once.

### Rotation and board normal

Intrinsic XYZ means **`Rx(x) * Ry(y) * Rz(z)`**. For fixed-axis application to a
point, this is Z, then Y, then X. All positive angles follow the right-hand
rule. `cad-rotation.ts` composes the existing JSCAD matrix primitives in that
order; positions and normals share this rotation.

With identity loader normalization, the orientation is:

| `model_board_normal_direction` | Local orientation |
| --- | --- |
| absent / `z+` | identity |
| `z-` | `Rx(180)` |
| `x+` | `Ry(-90)` |
| `x-` | `Ry(90)` |
| `y+` | `Rx(90)` |
| `y-` | `Rx(-90)` |

The declaration names a direction in the **native model's coordinates**, as
specified by the Circuit JSON schema. It is not a project-space face selector
and must not be reinterpreted after an axis remap. Compute the mapped normal
`L * nativeNormal`, then choose a proper rotation satisfying:

```text
B * L * nativeNormal = (0,0,1)
```

Geometry and explicit model-origin points receive the same `B * L`.
For nonidentity normalization, `B` is the shortest rotation from the mapped
normal to +Z; exactly opposite vectors retain the established X half-turn.
The normal constrains the up direction, while the loader's in-plane orientation
is retained rather than implicitly resetting the complete model basis.

An absent board-normal declaration still leaves the format's default
normalization unchanged. In particular, STL's legacy normalization changes
native +Y/+Z signs; an explicit declaration must account for that change rather
than accidentally treating native `y+` as normalized `y+`.

### Preserved origin policy

If `model_origin_position` exists, use it. Otherwise select
`model_origin_alignment ?? anchor_alignment`:

| Alignment | Inferred canonical datum |
| --- | --- |
| `center_of_component_on_board_surface` | Center of XY bounds of vertices near minimum Z; datum Z remains zero |
| `center` | Center of the full mesh bounds |
| Other / absent | Zero |

The contact tolerance remains `max(1e-6, height * 1e-5)`. If the contact subset
is empty, use full mesh bounds for the horizontal center. Inference occurs
after unit scaling and board-normal orientation, before fitting and authored
rotation. Only its axis names changed: old minimum Y / horizontal XZ becomes
minimum Z / horizontal XY.

The viewer currently retains the native origin when an explicit origin is
absent. That difference is intentional here: inference aligns the original
TO-92 fixture, but can misplace other assets such as the flashlight connector.
Neither renderer is a universal physical-placement oracle.

### Preserved fit policy

Fit uses the vertex-tight bounds of the prepared local mesh, not the viewer's
union of transformed source-geometry bounding-box corners. Presence of
`cad.size` enables fitting. The exporter historically scales both geometry and
the size target by `model_unit_to_mm_scale_factor`; that behavior is retained.
With measured local size `d` and unit factor `u`:

```text
ratio[i] = d[i] > 0 ? cad.size[i] * u / d[i] : 1
fill_bounds           => per-axis ratio
contain_within_bounds => uniform min(ratio)
missing size          => no fit
```

Containment is the default fit mode. Fitting does not center the model.
Normals receive inverse-transpose scaling and normalization. A baked
reflection reverses triangle winding so it agrees with the transformed
normals; a proper rotation does not. Zero-sized fit targets collapse the
geometry and produce zero normals, matching Three's singular normal matrix,
rather than aborting the export.

### Position and layer defaults

The PCB owner is looked up by `pcb_component_id`. Explicit rotation is used
unchanged, including `(0,0,0)` on bottom. With no rotation on bottom, GLTF/GLB
and footprinter retain the historical `Ry(180)` fallback (formerly intermediate
scene Z); other formats retain `Rx(180)`.

Supplied CAD positions, including bottom-side Z, are retained verbatim.
Missing positions use the PCB component's XY center and
`Z = +/- (boardThickness/2 + initialComponentHeight/2)`, with the negative sign
for bottom. The initial height is resolved before loading the model, as before.
The viewer's zero-position and nonnegative-bottom-Z adjustments are not adopted.

This is the CAD placement contract, not the viewer UI's input preprocessing.
The viewer can automatically create a faux board and adjust supplied Z values;
exporter faux-board generation remains opt-in. Pairwise comparisons must supply
the same explicit board and CAD positions to both pipelines.

## Format boundaries and compatibility exceptions

OBJ, GLTF/GLB, STEP and JSCAD use identity axis normalization by default.
GLTF/GLB retain asset node transforms before placement; GLB bytes supplied
through `model_gltf_url` are recognized by their header. STEP is tessellated
in millimeters. JSCAD geometry includes its CSG transforms before placement.
An explicit exporter `coordinateTransform` overrides format normalization.

STL model normalization preserves the exporter's existing physical orientation:
`(x,y,z) -> (x,-y,-z)` in canonical space. This is the old intermediate mapping
with its Y/Z scene swap removed. The exporter continues to decode real STL
files; the viewer's CAD STL branch currently uses its OBJ parser and is not a
reference for STL decoding.

Footprinter retains the exporter's common preparation path: unit scale,
board-normal orientation, origin policy and fitting all apply. The viewer's
separate placement-only footprinter path is not adopted. Native generated
JSCAD geometry needs no additional axis conversion.

The exporter's loader precedence is retained: STL, OBJ, GLB, GLTF, STEP,
JSCAD, then footprinter. This change does not add WRL support or copy the
viewer's runtime URL-fallback policy.

### Assets without scenes

`scenes` is optional in glTF. When both `scenes` and `scene` are absent, load
every unparented node under an identity virtual root. Preserve its complete
node hierarchy and each mesh instance; do not add unreferenced mesh resources
or translate the aggregate bounds to a new origin. Mesh-only payloads with
neither nodes nor scenes retain the existing identity-loading fallback.

When scenes exist, retain the explicit scene selection or the first-scene
default. An explicit scene index without scenes, invalid references, cycles
(including rootless cycles), or multiple parents still fail. The node graph
is validated before selecting or inferring roots.

Origin handling remains a separate, later operation. An explicit origin is
an asset-root datum, not a mesh-local point to run through each node again.
Inferred centering uses the fully transformed mesh, under the same existing
alignment rules. Upstream could load a sceneless asset while ignoring its
node transforms; correcting that can change bounds, but does not change the
origin-selection policy.

## Final export frame

The existing exported orientation is preserved with the single mapping:

```text
G = (-P.x, P.z, P.y)
P = (-G.x, G.z, G.y)
```

This maps project +Z to glTF +Y and has determinant +1. It is a proper
rotation, not an X-only reflection, and must not reverse winding.
Coordinates retain the package's historical mm-valued output; this change
does not introduce a global mm-to-meter conversion.

Board top/bottom classification uses canonical `normal.z`, and board texture
UVs use canonical XY before export. Cameras returned by `getBestCameraPosition`
are already in the final exported frame and need no second conversion.

## Regression coverage

The test-only upstream baseline is
[tscircuit/circuit-json-to-gltf#212](https://github.com/tscircuit/circuit-json-to-gltf/pull/212).
Its native-normal, explicit-origin, nonzero-Y board, sceneless-asset and binary
URL tests run byte-identically here. They observe asset-root or final glTF
coordinates, so no intermediate-axis or expected-value rewrites are needed.

`tests/unit/canonical-*.test.ts` covers actual local and exported world
geometry, board/panel drilling, all board-normal directions, and the retained
unit/datum/fit and footprinter policies.
`transform-mesh-*.test.ts` covers signed oblique and cardinal rotations,
mixed XYZ order, normals and reflection winding.
The GLB node tests cover nested transforms, matrices, instancing and normals.
Existing `3d-viewer` renderer-parity stories compare real output
with fixed cameras; their double-sided edge pass supplements, rather than
replaces, the numerical normal/winding assertions.
