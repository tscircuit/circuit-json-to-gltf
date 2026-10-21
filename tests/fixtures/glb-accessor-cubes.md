This reproduces issue #255 using three encodings of the same indexed 1 mm cube:
packed FLOAT positions, interleaved FLOAT positions (stride 24), and normalized
SHORT positions with 2-byte padding (stride 8, KHR_mesh_quantization).
The generator is deterministic and requires no downloaded assets or network services.
Each model passes through cad_component.model_glb_url, convertCircuitJsonToGltf,
and PoppyGL on the same 10 mm PCB, with identical placement and a fixed camera.

`tests/assets/glb-accessors-before/*.png` are frozen PoppyGL renders made with
`lib/loaders/glb.ts` from unfixed commit `89013a1c48d452fdf96f42e4d091942f6b8baed9`.
The snapshot's right column is rendered live using the current exporter. Packed
FLOAT is the control: it must look the same before and after. Interleaved data
collapses the cube's X extent before the fix. Quantized data produces a huge
orange wall before the fix; the corrected output matches the packed cube.
No geometry, camera, model scale or placement differs between columns.

To regenerate the frozen images, use a separate checkout of that unfixed commit,
copy `tests/fixtures/glb-accessor-cubes.ts` into it, install dependencies with Bun,
and run this from the checkout root:

```ts
import {
  cubeEncodings,
  renderAccessorCube,
} from "./tests/fixtures/glb-accessor-cubes"
for (const encoding of cubeEncodings) {
  await Bun.write(
    `tests/assets/glb-accessors-before/${encoding}.png`,
    await renderAccessorCube(encoding),
  )
}
```

This repro PR deliberately pins the broken dimensions: packed [1, 1, 1],
interleaved [0, 1, 1], and quantized [32767, 32767, 32767] mm. Both columns
show the unfixed renderer. PR #256 is stacked on this repro: it corrects the
decoder, updates the live column of the snapshot, and requires all three
component meshes to be 1 mm on every axis. Inspect the image before updating it.
