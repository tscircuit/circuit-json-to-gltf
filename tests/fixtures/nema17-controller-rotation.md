This repro uses the actual PCB from `imrishabh18/rp2040-motor-controller` 1.0.42 and the modelprinter `nema17_jstph6` model served by modelcdn with jscad-electronics 0.0.184. The pinned compressed GLBs keep the test independent of network services and future model releases.

The controller GLB was exported from the project's Circuit JSON with the assembly motor removed. PCB outline, mounting holes, USB connector and electronic components are preserved. The PCB surface materials have an explicit green factor because the nested GLB loader reads material factors but does not sample embedded textures. No geometry was changed.

The fixture describes a sideways installation in Circuit JSON: motor CAD rotation `{ x: 90, y: 90, z: 180 }`, shaft pointing along circuit +X, JST facing circuit -Y, and controller PCB 6 mm behind the rear face. The board's single-axis rotation remains correct with either exporter; the motor's combined rotation exposes the bug.

`nema17-controller-before.png` is a frozen render from the unfixed exporter at `8702787`, using this fixture and the same camera as the test. Generate it there with:

```ts
import { convertCircuitJsonToGltf } from "../../lib"
import { renderGLTFToPNGFromGLB } from "poppygl"
import {
  createNema17ControllerRotationRepro,
  motorControllerCamera,
} from "./nema17-controller-rotation"

const glb = await convertCircuitJsonToGltf(
  await createNema17ControllerRotationRepro(),
  { format: "glb" },
)
if (!(glb instanceof ArrayBuffer)) throw new Error("Expected binary glTF")
await Bun.write(
  "tests/assets/nema17-controller-before.png",
  await renderGLTFToPNGFromGLB(glb, motorControllerCamera),
)
```

The test renders the current exporter in the right panel. Both panels use identical assets, placement and camera. It also measures exported shaft-tip vertices and the PCB face, independently of the rotation implementation.
