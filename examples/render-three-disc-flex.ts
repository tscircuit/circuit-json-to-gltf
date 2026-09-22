import { mkdir } from "node:fs/promises"
import { join } from "node:path"
import { renderGLTFToPNGFromGLB } from "poppygl"
import { convertCircuitJsonToGltf } from "../lib"
import { createThreeDiscFlex } from "./three-disc-flex"

// bun examples/render-three-disc-flex.ts [output-directory]
const directory = process.argv[2] ?? "out/three-disc-flex"
await mkdir(directory, { recursive: true })
const circuit = createThreeDiscFlex()
await Bun.write(
  join(directory, "three-disc-flex.circuit.json"),
  JSON.stringify(circuit, null, 2),
)
for (const state of ["flat", "folded"] as const) {
  const glb = (await convertCircuitJsonToGltf(circuit, {
    format: "glb",
    foldPcbs: state === "folded",
    boardTextureResolution: 1024,
    showBoundingBoxes: true,
  })) as ArrayBuffer
  await Bun.write(join(directory, `${state}.glb`), glb)
  const png = await renderGLTFToPNGFromGLB(glb, {
    width: 1100,
    height: 800,
    ambient: 0.45,
    backgroundColor: "#f2f3f5",
    ...(state === "folded"
      ? { camPos: [20, 20, 25] as const, lookAt: [0, 6, 0] as const }
      : { camPos: [-22, 42, 34] as const, lookAt: [-22, 0, 0] as const }),
    cull: false,
  })
  await Bun.write(join(directory, `${state}.png`), png)
  console.log(`Wrote ${state}.glb and ${state}.png`)
}
